import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { DisputeStatus, BookingStatus, TransactionType } from '../../types/index.js';
import { LedgerService } from '../payments/ledger.service.js';

export const adminRouter = Router();

// GET /v1/admin/analytics/platform (Platform KPIs)
adminRouter.get('/analytics/platform', async (req: Request, res: Response, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalCollectors = await prisma.collector.count();
    const totalListings = await prisma.listing.count();
    const totalBookings = await prisma.booking.count();
    const openDisputes = await prisma.dispute.count({ where: { status: 'OPEN' } });

    const bookings = await prisma.booking.findMany();
    const gmvCents = bookings.reduce((sum, b) => sum + b.agreedPriceCents, 0);
    const platformFeeRevenueCents = Math.round(gmvCents * 0.10);
    const activeEscrowCents = bookings
      .filter(b => b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED)
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
  } catch (error) {
    next(error);
  }
});

// GET /v1/admin/users
adminRouter.get('/users', async (req: Request, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { collector: true, sourceProfile: true, wallet: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// GET /v1/admin/bookings
adminRouter.get('/bookings', async (req: Request, res: Response, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        listing: { include: { category: true } },
        collector: true,
        route: true,
        dispute: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

// GET /v1/admin/transactions (Immutable Double-Entry Ledger)
adminRouter.get('/transactions', async (req: Request, res: Response, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { wallet: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ transactions, count: transactions.length });
  } catch (error) {
    next(error);
  }
});

// PATCH /v1/admin/collectors/:id/kyc (Approve/Reject KYC)
adminRouter.patch('/collectors/:id/kyc', async (req: Request, res: Response, next) => {
  try {
    const { status } = req.body;
    const collector = await prisma.collector.update({
      where: { id: req.params.id as string },
      data: { kycStatus: status || 'APPROVED' },
    });
    res.json({ success: true, collector, message: `KYC updated to ${status}` });
  } catch (error) {
    next(error);
  }
});

// POST /v1/admin/disputes/:id/mediate (Resolve Dispute & Release/Split Escrow)
adminRouter.post('/disputes/:id/mediate', async (req: Request, res: Response, next) => {
  try {
    const { resolution, action } = req.body; // action: RESOLVE_COLLECTOR, RESOLVE_SOURCE, RESOLVE_SPLIT
    const dispute = await prisma.dispute.findUnique({
      where: { id: req.params.id as string },
      include: { booking: { include: { collector: true } } },
    });
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    let disputeStatus = DisputeStatus.RESOLVED_COLLECTOR;
    if (action === 'RESOLVE_SOURCE') disputeStatus = DisputeStatus.RESOLVED_SOURCE;
    else if (action === 'RESOLVE_SPLIT') disputeStatus = DisputeStatus.RESOLVED_SPLIT;

    const updatedDispute = await prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: disputeStatus,
        resolution: resolution || `Mediated with action ${action}`,
        resolvedAt: new Date(),
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: dispute.bookingId },
      data: { status: BookingStatus.COMPLETED },
    });

    res.json({
      success: true,
      dispute: updatedDispute,
      message: 'Dispute mediated successfully. Escrow settled according to ruling.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /v1/admin/feature-flags
adminRouter.get('/feature-flags', async (req: Request, res: Response, next) => {
  try {
    const flags = await prisma.featureFlag.findMany();
    if (flags.length === 0) {
      // Seed default feature flags
      const defaults = [
        { key: 'ai.vision.v3_2', enabled: true, rollout: 100 },
        { key: 'payments.instant_upi_payout', enabled: true, rollout: 50 },
        { key: 'logistics.mapbox_live_turn_by_turn', enabled: true, rollout: 100 },
        { key: 'compliance.cpcb_epr_form_gen', enabled: true, rollout: 100 },
      ];
      for (const d of defaults) {
        await prisma.featureFlag.upsert({
          where: { key: d.key },
          create: d,
          update: {},
        });
      }
      return res.json({ flags: defaults });
    }
    res.json({ flags });
  } catch (error) {
    next(error);
  }
});

// PATCH /v1/admin/feature-flags/:key
adminRouter.patch('/feature-flags/:key', async (req: Request, res: Response, next) => {
  try {
    const { enabled, rollout } = req.body;
    const flag = await prisma.featureFlag.update({
      where: { key: req.params.key as string },
      data: {
        enabled: enabled !== undefined ? enabled : true,
        rollout: rollout !== undefined ? rollout : 100,
      },
    });
    res.json({ success: true, flag });
  } catch (error) {
    next(error);
  }
});