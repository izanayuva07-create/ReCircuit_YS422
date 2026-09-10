import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AIService } from '../ai/ai.service.js';
import { MatchingService } from '../matching/matching.service.js';
import { LedgerService } from '../payments/ledger.service.js';
import { BUSINESS_RULES } from '../../lib/constants.js';
import { ListingStatus, BookingStatus } from '../../types/index.js';

export const sourceRouter = Router();

// Helper to get effective source user
const getSourceUser = async (req: Request) => {
  if (req.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { sourceProfile: true },
    });
    if (user) return user;
  }
  // Default demo source user
  return prisma.user.findFirst({
    where: { role: 'source' },
    include: { sourceProfile: true },
  });
};

// POST /v1/source/listings (Create listing + trigger AI classify)
sourceRouter.post('/listings', async (req: Request, res: Response, next) => {
  try {
    const user = await getSourceUser(req);
    if (!user) return res.status(401).json({ error: 'Source user not found' });

    // BR-007: Max 5 active listings guard
    const activeCount = await prisma.listing.count({
      where: {
        sourceId: user.id,
        status: { in: [ListingStatus.ACTIVE, ListingStatus.MATCHED, ListingStatus.BOOKED] },
      },
    });

    if (activeCount >= BUSINESS_RULES.MAX_SOURCE_ACTIVE_LISTINGS) {
      return res.status(400).json({
        type: 'https://recircuit.org/errors/listing-limit',
        title: 'Listing limit reached',
        status: 400,
        detail: `Source cannot have more than ${BUSINESS_RULES.MAX_SOURCE_ACTIVE_LISTINGS} active listings (BR-007).`,
      });
    }

    const {
      title,
      description,
      imageUrl,
      categorySlug,
      locationLat,
      locationLng,
      address,
      estimatedWeight,
    } = req.body;

    const img = imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80';

    // Run AI classification
    const aiResult = await AIService.classifyImage(img, title);
    const initialStatus = aiResult.isConfident ? ListingStatus.ACTIVE : ListingStatus.LOW_CONFIDENCE;

    // Find category
    const cat = await prisma.category.findFirst({
      where: { slug: categorySlug || aiResult.topPrediction.category_slug },
    });

    const listing = await prisma.listing.create({
      data: {
        sourceId: user.id,
        categoryId: cat?.id,
        title: title || aiResult.topPrediction.category_name,
        description: description || `E-waste item detected as ${aiResult.topPrediction.category_name}`,
        images: JSON.stringify([img]),
        status: initialStatus,
        aiPredictions: JSON.stringify(aiResult.predictions),
        aiConfidence: aiResult.topPrediction.confidence,
        aiModelVersion: aiResult.modelVersion,
        extractedAttrs: JSON.stringify(aiResult.topPrediction.attributes),
        locationLat: locationLat || 28.6139,
        locationLng: locationLng || 77.2090,
        address: address || 'Connaught Place, New Delhi',
        estimatedWeight: estimatedWeight || aiResult.topPrediction.attributes.estimated_weight_kg || 2.0,
      },
      include: { category: true },
    });

    res.status(201).json({
      listing,
      aiAnalysis: aiResult,
    });
  } catch (error) {
    next(error);
  }
});

// GET /v1/source/listings (List user or all marketplace listings)
sourceRouter.get('/listings', async (req: Request, res: Response, next) => {
  try {
    const { all } = req.query;
    const user = await getSourceUser(req);
    const shouldFetchAll = all === 'true' || !user || req.user?.role === 'collector' || req.user?.role === 'admin';
    const listings = await prisma.listing.findMany({
      where: shouldFetchAll ? {} : { sourceId: user.id },
      include: {
        category: true,
        bookings: { include: { collector: true } },
        bids: { include: { collector: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ listings, count: listings.length });
  } catch (error) {
    next(error);
  }
});

// GET /v1/source/listings/:id
sourceRouter.get('/listings/:id', async (req: Request, res: Response, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id as string },
      include: { category: true, bookings: { include: { collector: true } } },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    next(error);
  }
});

// GET /v1/source/listings/:id/matches (Ranked collectors)
sourceRouter.get('/listings/:id/matches', async (req: Request, res: Response, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id as string },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const matches = await MatchingService.findMatchingCollectors({
      listingId: listing.id,
      lat: listing.locationLat,
      lng: listing.locationLng,
      radiusKm: 50,
    });

    res.json(matches);
  } catch (error) {
    next(error);
  }
});

// POST /v1/source/listings/:id/book (Create booking & lock escrow)
sourceRouter.post('/listings/:id/book', async (req: Request, res: Response, next) => {
  try {
    const user = await getSourceUser(req);
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id as string },
      include: { category: true },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const { collectorId, agreedPriceCents, fulfillmentType, scheduledAt } = req.body;
    if (!collectorId) return res.status(400).json({ error: 'collectorId is required' });

    const collector = await prisma.collector.findUnique({
      where: { id: collectorId },
      include: { user: true },
    });
    if (!collector) return res.status(404).json({ error: 'Collector not found' });

    const price = agreedPriceCents || listing.category?.avgMarketPriceCents || 250000;
    const platformFee = Math.round(price * BUSINESS_RULES.PLATFORM_COMMISSION_RATE);

    // Get platform admin user for escrow hold
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    const platformUserId = adminUser?.id || user!.id;

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        listingId: listing.id,
        collectorId: collector.id,
        sourceId: user?.id || listing.sourceId,
        fulfillmentType: fulfillmentType || 'PICKUP',
        status: BookingStatus.BOOKED,
        agreedPriceCents: price,
        escrowHeldCents: price,
        platformFeeCents: platformFee,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
    });

    // Create Initial Booking Route for tracking
    await prisma.bookingRoute.create({
      data: {
        bookingId: booking.id,
        currentLat: collector.locationLat,
        currentLng: collector.locationLng,
        heading: 45,
        speed: 0,
        etaMinutes: 25,
      },
    });

    // Update listing status to BOOKED
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: ListingStatus.BOOKED },
    });

    // Execute double-entry escrow hold
    if (user) {
      await LedgerService.holdEscrow({
        sourceUserId: user.id,
        bookingId: booking.id,
        amountCents: price,
        platformUserId,
      });
    }

    res.status(201).json({
      booking,
      escrowLocked: true,
      amountCents: price,
      message: 'Collector booked! Funds securely placed in Escrow.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /v1/source/bookings (List bookings)
sourceRouter.get('/bookings', async (req: Request, res: Response, next) => {
  try {
    const user = await getSourceUser(req);
    const bookings = await prisma.booking.findMany({
      where: user ? { sourceId: user.id } : {},
      include: {
        listing: { include: { category: true } },
        collector: { include: { user: true } },
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

// GET /v1/source/bookings/:id/track (Live tracking telemetry)
sourceRouter.get('/bookings/:id/track', async (req: Request, res: Response, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: {
        route: true,
        listing: true,
        collector: true,
      },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json({
      bookingId: booking.id,
      status: booking.status,
      collector: {
        id: booking.collector.id,
        name: booking.collector.businessName,
        rating: booking.collector.rating,
      },
      route: booking.route,
      destination: {
        lat: booking.listing.locationLat,
        lng: booking.listing.locationLng,
        address: booking.listing.address,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /v1/source/bookings/:id/confirm-completion (Confirm receipt & release escrow)
sourceRouter.patch('/bookings/:id/confirm-completion', async (req: Request, res: Response, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { collector: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    const platformUserId = adminUser?.id || booking.sourceId;

    // Release escrow via Double-Entry Ledger (BR-003, BR-004)
    const ledgerResult = await LedgerService.releaseEscrow({
      collectorUserId: booking.collector.userId,
      bookingId: booking.id,
      totalAmountCents: booking.agreedPriceCents,
      platformUserId,
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Update listing
    await prisma.listing.update({
      where: { id: booking.listingId },
      data: { status: ListingStatus.COMPLETED },
    });

    // Increment collector total collections
    await prisma.collector.update({
      where: { id: booking.collectorId },
      data: { totalCollections: { increment: 1 } },
    });

    res.json({
      success: true,
      booking: updatedBooking,
      escrowReleased: true,
      settlement: ledgerResult,
    });
  } catch (error) {
    next(error);
  }
});

// POST /v1/source/bookings/:id/rate (BR-005)
sourceRouter.post('/bookings/:id/rate', async (req: Request, res: Response, next) => {
  try {
    const { rating, review } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id as string } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // BR-005: Rating allowed only after COMPLETED
    if (booking.status !== BookingStatus.COMPLETED) {
      return res.status(400).json({
        type: 'https://recircuit.org/errors/invalid-state',
        title: 'Rating not allowed yet',
        detail: 'Ratings are only allowed after booking is COMPLETED (BR-005).',
      });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        collectorRating: rating,
        collectorReview: review,
      },
    });

    // Update collector average rating
    const collectorBookings = await prisma.booking.findMany({
      where: { collectorId: booking.collectorId, collectorRating: { not: null } },
    });
    const avgRating = collectorBookings.reduce((sum, b) => sum + (b.collectorRating || 5), 0) / collectorBookings.length;
    await prisma.collector.update({
      where: { id: booking.collectorId },
      data: { rating: parseFloat(avgRating.toFixed(2)) },
    });

    res.json({ success: true, booking: updated });
  } catch (error) {
    next(error);
  }
});

// POST /v1/source/bookings/:id/dispute (BR-009: 48h dispute window)
sourceRouter.post('/bookings/:id/dispute', async (req: Request, res: Response, next) => {
  try {
    const { reason, description, evidence } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id as string } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // BR-009: Dispute window check if completed
    if (booking.completedAt) {
      const hoursSinceCompletion = (Date.now() - booking.completedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > BUSINESS_RULES.DISPUTE_WINDOW_HOURS) {
        return res.status(400).json({
          type: 'https://recircuit.org/errors/dispute-window-closed',
          title: 'Dispute window expired',
          detail: `Disputes must be raised within ${BUSINESS_RULES.DISPUTE_WINDOW_HOURS} hours post-completion (BR-009).`,
        });
      }
    }

    const dispute = await prisma.dispute.create({
      data: {
        bookingId: booking.id,
        raisedBy: booking.sourceId,
        reason: reason || 'ITEM_MISMATCH',
        description: description || 'Item was not as described or collector failed to appear.',
        evidence: JSON.stringify(evidence || []),
        status: 'OPEN',
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.DISPUTED },
    });

    res.status(201).json({ success: true, dispute, message: 'Dispute opened. Funds frozen in escrow.' });
  } catch (error) {
    next(error);
  }
});

// GET /v1/source/wallet
sourceRouter.get('/wallet', async (req: Request, res: Response, next) => {
  try {
    const user = await getSourceUser(req);
    if (!user) return res.status(401).json({ error: 'Source user not found' });

    const wallet = await LedgerService.getOrCreateWallet(user.id);
    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ wallet, transactions });
  } catch (error) {
    next(error);
  }
});
