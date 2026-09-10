"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const index_js_1 = require("../../types/index.js");
const constants_js_1 = require("../../lib/constants.js");
class LedgerService {
    // Ensure a wallet exists for a user
    static async getOrCreateWallet(userId) {
        let wallet = await prisma_js_1.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            wallet = await prisma_js_1.prisma.wallet.create({
                data: {
                    userId,
                    balanceCents: 100000, // Seed default demo balance ₹1,000.00
                    currency: 'INR',
                },
            });
        }
        return wallet;
    }
    // Double-entry booking escrow hold
    static async holdEscrow(params) {
        const { sourceUserId, bookingId, amountCents, platformUserId } = params;
        const sourceWallet = await this.getOrCreateWallet(sourceUserId);
        const platformWallet = await this.getOrCreateWallet(platformUserId);
        const sourceNewBal = sourceWallet.balanceCents - amountCents;
        const platformNewBal = platformWallet.balanceCents + amountCents;
        // Transaction 1: Source debit
        await prisma_js_1.prisma.transaction.create({
            data: {
                walletId: sourceWallet.id,
                type: index_js_1.TransactionType.ESCROW_HOLD,
                amountCents: -amountCents,
                balanceAfterCents: sourceNewBal,
                refId: bookingId,
                refType: 'booking',
                description: `Escrow hold for Booking #${bookingId}`,
            },
        });
        await prisma_js_1.prisma.wallet.update({
            where: { id: sourceWallet.id },
            data: { balanceCents: sourceNewBal },
        });
        // Transaction 2: Platform credit
        await prisma_js_1.prisma.transaction.create({
            data: {
                walletId: platformWallet.id,
                type: index_js_1.TransactionType.ESCROW_HOLD,
                amountCents: amountCents,
                balanceAfterCents: platformNewBal,
                refId: bookingId,
                refType: 'booking',
                description: `Escrow held for Booking #${bookingId}`,
            },
        });
        await prisma_js_1.prisma.wallet.update({
            where: { id: platformWallet.id },
            data: { balanceCents: platformNewBal },
        });
        return { success: true, escrowHeldCents: amountCents };
    }
    // Double-entry booking escrow release upon verified completion
    // BR-003: 10% platform commission, 90% collector payout
    static async releaseEscrow(params) {
        const { collectorUserId, bookingId, totalAmountCents, platformUserId } = params;
        const platformFeeCents = Math.round(totalAmountCents * constants_js_1.BUSINESS_RULES.PLATFORM_COMMISSION_RATE);
        const collectorPayoutCents = totalAmountCents - platformFeeCents;
        const platformWallet = await this.getOrCreateWallet(platformUserId);
        const collectorWallet = await this.getOrCreateWallet(collectorUserId);
        // 1. Platform releases escrow hold (-totalAmountCents)
        const platformAfterRelease = platformWallet.balanceCents - totalAmountCents;
        await prisma_js_1.prisma.transaction.create({
            data: {
                walletId: platformWallet.id,
                type: index_js_1.TransactionType.ESCROW_RELEASE,
                amountCents: -totalAmountCents,
                balanceAfterCents: platformAfterRelease,
                refId: bookingId,
                refType: 'booking',
                description: `Escrow release for Booking #${bookingId}`,
            },
        });
        // 2. Collector receives payout (+90%)
        const collectorNewBal = collectorWallet.balanceCents + collectorPayoutCents;
        await prisma_js_1.prisma.transaction.create({
            data: {
                walletId: collectorWallet.id,
                type: index_js_1.TransactionType.ESCROW_RELEASE,
                amountCents: collectorPayoutCents,
                balanceAfterCents: collectorNewBal,
                refId: bookingId,
                refType: 'booking',
                description: `Payout (90%) for completed Booking #${bookingId}`,
            },
        });
        await prisma_js_1.prisma.wallet.update({
            where: { id: collectorWallet.id },
            data: { balanceCents: collectorNewBal },
        });
        // 3. Platform earns commission fee (+10%)
        const platformFinalBal = platformAfterRelease + platformFeeCents;
        await prisma_js_1.prisma.transaction.create({
            data: {
                walletId: platformWallet.id,
                type: index_js_1.TransactionType.PLATFORM_FEE,
                amountCents: platformFeeCents,
                balanceAfterCents: platformFinalBal,
                refId: bookingId,
                refType: 'fee',
                description: `Platform fee (10%) for Booking #${bookingId}`,
            },
        });
        await prisma_js_1.prisma.wallet.update({
            where: { id: platformWallet.id },
            data: { balanceCents: platformFinalBal },
        });
        return {
            collectorPayoutCents,
            platformFeeCents,
            collectorBalanceAfter: collectorNewBal,
        };
    }
    // Reconciliation: Verify balance integrity (balanceCents === sum(transactions))
    static async verifyWalletIntegrity(walletId) {
        const wallet = await prisma_js_1.prisma.wallet.findUnique({
            where: { id: walletId },
            include: { transactions: true },
        });
        if (!wallet)
            return { valid: false, error: 'Wallet not found' };
        const calculatedSum = wallet.transactions.reduce((acc, tx) => acc + tx.amountCents, 0);
        const isValid = wallet.balanceCents === calculatedSum;
        return {
            walletId,
            storedBalance: wallet.balanceCents,
            calculatedSum,
            valid: isValid,
        };
    }
}
exports.LedgerService = LedgerService;
