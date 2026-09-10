import { prisma } from '../../lib/prisma.js';
import { TransactionType } from '../../types/index.js';
import { BUSINESS_RULES } from '../../lib/constants.js';

export class LedgerService {
  // Ensure a wallet exists for a user
  static async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
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
  static async holdEscrow(params: {
    sourceUserId: string;
    bookingId: string;
    amountCents: number;
    platformUserId: string;
  }) {
    const { sourceUserId, bookingId, amountCents, platformUserId } = params;

    const sourceWallet = await this.getOrCreateWallet(sourceUserId);
    const platformWallet = await this.getOrCreateWallet(platformUserId);

    const sourceNewBal = sourceWallet.balanceCents - amountCents;
    const platformNewBal = platformWallet.balanceCents + amountCents;

    // Transaction 1: Source debit
    await prisma.transaction.create({
      data: {
        walletId: sourceWallet.id,
        type: TransactionType.ESCROW_HOLD,
        amountCents: -amountCents,
        balanceAfterCents: sourceNewBal,
        refId: bookingId,
        refType: 'booking',
        description: `Escrow hold for Booking #${bookingId}`,
      },
    });

    await prisma.wallet.update({
      where: { id: sourceWallet.id },
      data: { balanceCents: sourceNewBal },
    });

    // Transaction 2: Platform credit
    await prisma.transaction.create({
      data: {
        walletId: platformWallet.id,
        type: TransactionType.ESCROW_HOLD,
        amountCents: amountCents,
        balanceAfterCents: platformNewBal,
        refId: bookingId,
        refType: 'booking',
        description: `Escrow held for Booking #${bookingId}`,
      },
    });

    await prisma.wallet.update({
      where: { id: platformWallet.id },
      data: { balanceCents: platformNewBal },
    });

    return { success: true, escrowHeldCents: amountCents };
  }

  // Double-entry booking escrow release upon verified completion
  // BR-003: 10% platform commission, 90% collector payout
  static async releaseEscrow(params: {
    collectorUserId: string;
    bookingId: string;
    totalAmountCents: number;
    platformUserId: string;
  }) {
    const { collectorUserId, bookingId, totalAmountCents, platformUserId } = params;

    const platformFeeCents = Math.round(totalAmountCents * BUSINESS_RULES.PLATFORM_COMMISSION_RATE);
    const collectorPayoutCents = totalAmountCents - platformFeeCents;

    const platformWallet = await this.getOrCreateWallet(platformUserId);
    const collectorWallet = await this.getOrCreateWallet(collectorUserId);

    // 1. Platform releases escrow hold (-totalAmountCents)
    const platformAfterRelease = platformWallet.balanceCents - totalAmountCents;
    await prisma.transaction.create({
      data: {
        walletId: platformWallet.id,
        type: TransactionType.ESCROW_RELEASE,
        amountCents: -totalAmountCents,
        balanceAfterCents: platformAfterRelease,
        refId: bookingId,
        refType: 'booking',
        description: `Escrow release for Booking #${bookingId}`,
      },
    });

    // 2. Collector receives payout (+90%)
    const collectorNewBal = collectorWallet.balanceCents + collectorPayoutCents;
    await prisma.transaction.create({
      data: {
        walletId: collectorWallet.id,
        type: TransactionType.ESCROW_RELEASE,
        amountCents: collectorPayoutCents,
        balanceAfterCents: collectorNewBal,
        refId: bookingId,
        refType: 'booking',
        description: `Payout (90%) for completed Booking #${bookingId}`,
      },
    });

    await prisma.wallet.update({
      where: { id: collectorWallet.id },
      data: { balanceCents: collectorNewBal },
    });

    // 3. Platform earns commission fee (+10%)
    const platformFinalBal = platformAfterRelease + platformFeeCents;
    await prisma.transaction.create({
      data: {
        walletId: platformWallet.id,
        type: TransactionType.PLATFORM_FEE,
        amountCents: platformFeeCents,
        balanceAfterCents: platformFinalBal,
        refId: bookingId,
        refType: 'fee',
        description: `Platform fee (10%) for Booking #${bookingId}`,
      },
    });

    await prisma.wallet.update({
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
  static async verifyWalletIntegrity(walletId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      include: { transactions: true },
    });

    if (!wallet) return { valid: false, error: 'Wallet not found' };

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
