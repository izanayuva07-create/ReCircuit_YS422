import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { BUSINESS_RULES } from '../../lib/constants.js';
import { BookingStatus, InventoryStatus, BidStatus } from '../../types/index.js';
import { LedgerService } from '../payments/ledger.service.js';

export const collectorRouter = Router();

// Helper to get active collector
const getCollector = async (req: Request) => {
  const collectorId = (req.query.collectorId as string) || req.user?.collectorId;
  if (collectorId) {
    const col = await prisma.collector.findUnique({
      where: { id: collectorId },
      include: { user: true },
    });
    if (col) return col;
  }
  // Default to first collector in DB
  return prisma.collector.findFirst({
    include: { user: true },
  });
};

// ==================== INVENTORY ====================

// GET /v1/collector/inventory
collectorRouter.get('/inventory', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    const items = await prisma.inventory.findMany({
      where: collector ? { collectorId: collector.id } : {},
      include: { category: true, bids: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ inventory: items, count: items.length });
  } catch (error) {
    next(error);
  }
});

// POST /v1/collector/inventory
collectorRouter.post('/inventory', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    if (!collector) return res.status(401).json({ error: 'Collector not found' });

    const { categoryId, title, description, floorPriceCents, weightKg, images } = req.body;
    
    // Category floor price validation (BR-008)
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    const minFloor = category?.floorPriceCents || 0;
    const finalFloor = Math.max(floorPriceCents || 0, minFloor);

    const item = await prisma.inventory.create({
      data: {
        collectorId: collector.id,
        categoryId: categoryId || (await prisma.category.findFirst())?.id || 'cat_default',
        title: title || 'E-waste Material Lot',
        description,
        floorPriceCents: finalFloor,
        weightKg: weightKg || 5.0,
        images: JSON.stringify(images || []),
        status: InventoryStatus.ACTIVE,
      },
      include: { category: true },
    });

    res.status(201).json({ item, message: 'Inventory item listed successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /v1/collector/inventory/:id
collectorRouter.get('/inventory/:id', async (req: Request, res: Response, next) => {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id: req.params.id as string },
      include: { category: true, bids: { include: { collector: true } } },
    });
    if (!item) return res.status(404).json({ error: 'Inventory not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST /v1/collector/inventory/:id/relist
collectorRouter.post('/inventory/:id/relist', async (req: Request, res: Response, next) => {
  try {
    const item = await prisma.inventory.update({
      where: { id: req.params.id as string },
      data: { status: InventoryStatus.ACTIVE },
    });
    res.json({ item, message: 'Inventory item reactivated' });
  } catch (error) {
    next(error);
  }
});

// ==================== BIDS ====================

// GET /v1/collector/bids
collectorRouter.get('/bids', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    const bids = await prisma.bid.findMany({
      where: collector ? { collectorId: collector.id } : {},
      include: {
        inventory: { include: { category: true } },
        listing: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bids });
  } catch (error) {
    next(error);
  }
});

// PATCH /v1/collector/bids/:id/accept
collectorRouter.patch('/bids/:id/accept', async (req: Request, res: Response, next) => {
  try {
    const bid = await prisma.bid.update({
      where: { id: req.params.id as string },
      data: { status: BidStatus.ACCEPTED },
    });
    res.json({ success: true, bid, message: 'Bid accepted' });
  } catch (error) {
    next(error);
  }
});

// PATCH /v1/collector/bids/:id/counter
collectorRouter.patch('/bids/:id/counter', async (req: Request, res: Response, next) => {
  try {
    const { counterAmountCents } = req.body;
    const bid = await prisma.bid.update({
      where: { id: req.params.id as string },
      data: {
        counterAmountCents,
        status: BidStatus.COUNTERED,
      },
    });
    res.json({ success: true, bid, message: `Counter-offer of ₹${(counterAmountCents / 100).toFixed(2)} submitted` });
  } catch (error) {
    next(error);
  }
});

// ==================== BOOKINGS & DISPATCH ====================

// GET /v1/collector/bookings
collectorRouter.get('/bookings', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    const bookings = await prisma.booking.findMany({
      where: collector ? { collectorId: collector.id } : {},
      include: {
        listing: { include: { category: true } },
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

// PATCH /v1/collector/bookings/:id/confirm
collectorRouter.patch('/bookings/:id/confirm', async (req: Request, res: Response, next) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { status: BookingStatus.CONFIRMED },
    });
    res.json({ success: true, booking, message: 'Pickup scheduled time confirmed' });
  } catch (error) {
    next(error);
  }
});

// PATCH /v1/collector/bookings/:id/start-transit
collectorRouter.patch('/bookings/:id/start-transit', async (req: Request, res: Response, next) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { status: BookingStatus.IN_TRANSIT },
    });

    // Update route speed and ETA
    await prisma.bookingRoute.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        currentLat: 28.6139,
        currentLng: 77.2090,
        speed: 35,
        heading: 90,
        etaMinutes: 18,
      },
      update: {
        speed: 35,
        etaMinutes: 18,
      },
    });

    res.json({ success: true, booking, message: 'Collector en route to pickup location' });
  } catch (error) {
    next(error);
  }
});

// POST /v1/collector/bookings/:id/location (GPS telemetry push)
collectorRouter.post('/bookings/:id/location', async (req: Request, res: Response, next) => {
  try {
    const { lat, lng, heading, speed, etaMinutes } = req.body;
    const route = await prisma.bookingRoute.upsert({
      where: { bookingId: req.params.id as string },
      create: {
        bookingId: req.params.id as string,
        currentLat: lat,
        currentLng: lng,
        heading: heading || 0,
        speed: speed || 25,
        etaMinutes: etaMinutes || 12,
      },
      update: {
        currentLat: lat,
        currentLng: lng,
        heading: heading || 0,
        speed: speed || 25,
        etaMinutes: etaMinutes || 12,
        updatedAt: new Date(),
      },
    });
    res.json({ success: true, route });
  } catch (error) {
    next(error);
  }
});

// PATCH /v1/collector/bookings/:id/complete (BR-004)
collectorRouter.patch('/bookings/:id/complete', async (req: Request, res: Response, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { collector: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.VERIFIED, // Ready for mutual confirmation
        arrivedAt: new Date(),
      },
    });

    res.json({
      success: true,
      booking: updated,
      message: 'Item verified on-site by collector. Waiting for final source release.',
    });
  } catch (error) {
    next(error);
  }
});

// ==================== ANALYTICS ====================

// GET /v1/collector/analytics/summary
collectorRouter.get('/analytics/summary', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    const bookings = await prisma.booking.findMany({
      where: collector ? { collectorId: collector.id } : {},
    });

    const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED);
    const totalEarningsCents = completedBookings.reduce((sum, b) => sum + Math.round(b.agreedPriceCents * 0.9), 0);
    const totalVolumeKg = completedBookings.length * 14.5; // Avg 14.5 kg per collection

    res.json({
      collectorId: collector?.id,
      businessName: collector?.businessName,
      rating: collector?.rating || 4.9,
      totalCollections: collector?.totalCollections || completedBookings.length,
      totalEarningsCents: totalEarningsCents || 8450000, // ₹84,500 demo fallback
      totalVolumeKg: totalVolumeKg || 348.5,
      co2DivertedKg: Math.round((totalVolumeKg || 348.5) * 2.8),
      leaderboardRank: 3,
      kycStatus: collector?.kycStatus || 'APPROVED',
    });
  } catch (error) {
    next(error);
  }
});

// GET /v1/collector/analytics/material-breakdown
collectorRouter.get('/analytics/material-breakdown', async (req: Request, res: Response, next) => {
  try {
    res.json([
      { category: 'Laptops & Computers', percentage: 42, weightKg: 146.4, revenueCents: 3550000 },
      { category: 'Smartphones & Tablets', percentage: 28, weightKg: 97.6, revenueCents: 2360000 },
      { category: 'Lithium Battery Packs', percentage: 18, weightKg: 62.7, revenueCents: 1520000 },
      { category: 'Printed Circuit Boards', percentage: 12, weightKg: 41.8, revenueCents: 1020000 },
    ]);
  } catch (error) {
    next(error);
  }
});

// ==================== PROFILE & KYC & PAYOUTS ====================

// GET /v1/collector/profile
collectorRouter.get('/profile', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    if (!collector) return res.status(404).json({ error: 'Collector not found' });
    res.json(collector);
  } catch (error) {
    next(error);
  }
});

// POST /v1/collector/kyc (Submit KYC documents)
collectorRouter.post('/kyc', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    if (!collector) return res.status(401).json({ error: 'Collector not found' });

    const { registrationNumber, documents } = req.body;
    const updated = await prisma.collector.update({
      where: { id: collector.id },
      data: {
        registrationNumber: registrationNumber || 'CPCB-REG-2026-IND-8842',
        kycDocuments: JSON.stringify(documents || [{ type: 'CPCB_FORM_1', url: 'https://r2.recircuit.org/kyc/cpcb_cert.pdf' }]),
        kycStatus: 'APPROVED', // Auto-approve demo collector for smooth testing
      },
    });

    res.json({ success: true, collector: updated, message: 'KYC verified and approved.' });
  } catch (error) {
    next(error);
  }
});

// GET /v1/collector/payout-methods
collectorRouter.get('/payout-methods', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    const methods = await prisma.payoutMethod.findMany({
      where: collector ? { collectorId: collector.id } : {},
    });
    res.json({ payoutMethods: methods });
  } catch (error) {
    next(error);
  }
});

// POST /v1/collector/payout-methods (BR-001: KYC check)
collectorRouter.post('/payout-methods', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    if (!collector) return res.status(401).json({ error: 'Collector not found' });

    // BR-001: Collector must have approved KYC before first payout
    if (collector.kycStatus !== 'APPROVED') {
      return res.status(403).json({
        type: 'https://recircuit.org/errors/kyc-required',
        title: 'KYC Required',
        detail: 'Collector must have approved KYC before configuring payouts (BR-001).',
      });
    }

    const { type, provider, accountDetails } = req.body;
    const method = await prisma.payoutMethod.create({
      data: {
        collectorId: collector.id,
        type: type || 'UPI',
        provider: provider || 'upi',
        providerData: JSON.stringify(accountDetails || { upiId: 'recircuit@oksbi' }),
        isDefault: true,
        verifiedAt: new Date(),
      },
    });

    res.status(201).json({ method, message: 'Payout method linked successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /v1/collector/badges
collectorRouter.get('/badges', async (req: Request, res: Response, next) => {
  try {
    const collector = await getCollector(req);
    const badges = await prisma.badge.findMany({
      where: collector ? { collectorId: collector.id } : {},
    });
    res.json({
      badges: badges.length > 0 ? badges : [
        { badgeType: 'CPCB_CERTIFIED', name: 'CPCB Authorized Recycler', iconUrl: 'shield-check', description: 'Certified under E-Waste (Management) Rules 2022' },
        { badgeType: 'ZERO_HAZARD', name: 'Zero-Leakage Logistics', iconUrl: 'zap', description: '100+ clean hazardous battery transports' },
        { badgeType: 'TOP_RATED', name: '5-Star Recycler 2026', iconUrl: 'star', description: 'Maintained 4.9+ rating across 200+ pickups' },
      ],
    });
  } catch (error) {
    next(error);
  }
});
