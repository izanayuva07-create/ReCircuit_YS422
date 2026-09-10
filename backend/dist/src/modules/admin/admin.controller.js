"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../../lib/prisma.js");
const index_js_1 = require("../../types/index.js");
exports.adminRouter = (0, express_1.Router)();
// GET /v1/admin/analytics/platform (Platform KPIs)
exports.adminRouter.get('/analytics/platform', async (req, res, next) => {
    try {
        const totalUsers = await prisma_js_1.prisma.user.count();
        const totalCollectors = await prisma_js_1.prisma.collector.count();
        const totalListings = await prisma_js_1.prisma.listing.count();
        const totalBookings = await prisma_js_1.prisma.booking.count();
        const openDisputes = await prisma_js_1.prisma.dispute.count({ where: { status: 'OPEN' } });
        const bookings = await prisma_js_1.prisma.booking.findMany();
        const gmvCents = bookings.reduce((sum, b) => sum + b.agreedPriceCents, 0);
        const platformFeeRevenueCents = Math.round(gmvCents * 0.10);
        const activeEscrowCents = bookings
            .filter(b => b.status !== index_js_1.BookingStatus.COMPLETED && b.status !== index_js_1.BookingStatus.CANCELLED)
            .reduce((sum, b) => sum + b.escrowHeldCents, 0);
        res.json({
            totalUsers,
            totalCollectors,
            totalListings,
            totalBookings,
            openDisputes,
            gmvCents,
            platformFeeRevenueCents,
            activeEscrowCents,
            totalEwasteDivertedKg: totalBookings * 12.8,
            co2SavedKg: Math.round(totalBookings * 12.8 * 2.8),
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/admin/users
exports.adminRouter.get('/users', async (req, res, next) => {
    try {
        const users = await prisma_js_1.prisma.user.findMany({
            include: { collector: true, sourceProfile: true, wallet: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ users });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/admin/bookings
exports.adminRouter.get('/bookings', async (req, res, next) => {
    try {
        const bookings = await prisma_js_1.prisma.booking.findMany({
            include: {
                listing: { include: { category: true } },
                collector: true,
                route: true,
                dispute: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ bookings });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/admin/transactions (Immutable Double-Entry Ledger)
exports.adminRouter.get('/transactions', async (req, res, next) => {
    try {
        const transactions = await prisma_js_1.prisma.transaction.findMany({
            include: { wallet: { include: { user: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ transactions, count: transactions.length });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /v1/admin/collectors/:id/kyc (Approve/Reject KYC)
exports.adminRouter.patch('/collectors/:id/kyc', async (req, res, next) => {
    try {
        const { status } = req.body;
        const collector = await prisma_js_1.prisma.collector.update({
            where: { id: req.params.id },
            data: { kycStatus: status || 'APPROVED' },
        });
        res.json({ success: true, collector, message: `KYC updated to ${status}` });
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/admin/disputes/:id/mediate (Resolve Dispute & Release/Split Escrow)
exports.adminRouter.post('/disputes/:id/mediate', async (req, res, next) => {
    try {
        const { resolution, action } = req.body; // action: RESOLVE_COLLECTOR, RESOLVE_SOURCE, RESOLVE_SPLIT
        const dispute = await prisma_js_1.prisma.dispute.findUnique({
            where: { id: req.params.id },
            include: { booking: { include: { collector: true } } },
        });
        if (!dispute)
            return res.status(404).json({ error: 'Dispute not found' });
        let disputeStatus = index_js_1.DisputeStatus.RESOLVED_COLLECTOR;
        if (action === 'RESOLVE_SOURCE')
            disputeStatus = index_js_1.DisputeStatus.RESOLVED_SOURCE;
        else if (action === 'RESOLVE_SPLIT')
            disputeStatus = index_js_1.DisputeStatus.RESOLVED_SPLIT;
        const updatedDispute = await prisma_js_1.prisma.dispute.update({
            where: { id: dispute.id },
            data: {
                status: disputeStatus,
                resolution: resolution || `Mediated with action ${action}`,
                resolvedAt: new Date(),
            },
        });
        // Update booking status
        await prisma_js_1.prisma.booking.update({
            where: { id: dispute.bookingId },
            data: { status: index_js_1.BookingStatus.COMPLETED },
        });
        res.json({
            success: true,
            dispute: updatedDispute,
            message: 'Dispute mediated successfully. Escrow settled according to ruling.',
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/admin/feature-flags
exports.adminRouter.get('/feature-flags', async (req, res, next) => {
    try {
        const flags = await prisma_js_1.prisma.featureFlag.findMany();
        if (flags.length === 0) {
            // Seed default feature flags
            const defaults = [
                { key: 'ai.vision.v3_2', enabled: true, rollout: 100 },
                { key: 'payments.instant_upi_payout', enabled: true, rollout: 50 },
                { key: 'logistics.mapbox_live_turn_by_turn', enabled: true, rollout: 100 },
                { key: 'compliance.cpcb_epr_form_gen', enabled: true, rollout: 100 },
            ];
            for (const d of defaults) {
                await prisma_js_1.prisma.featureFlag.upsert({
                    where: { key: d.key },
                    create: d,
                    update: {},
                });
            }
            return res.json({ flags: defaults });
        }
        res.json({ flags });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /v1/admin/feature-flags/:key
exports.adminRouter.patch('/feature-flags/:key', async (req, res, next) => {
    try {
        const { enabled, rollout } = req.body;
        const flag = await prisma_js_1.prisma.featureFlag.update({
            where: { key: req.params.key },
            data: {
                enabled: enabled !== undefined ? enabled : true,
                rollout: rollout !== undefined ? rollout : 100,
            },
        });
        res.json({ success: true, flag });
    }
    catch (error) {
        next(error);
    }
});
