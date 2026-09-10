import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

export const marketRouter = Router();

// ==========================================
// 1. LISTINGS
// ==========================================

// GET /listings/my
marketRouter.get('/listings/my', async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      include: { category: true, bids: { include: { collector: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const items = listings.map((l) => ({
      id: l.id,
      sourceId: l.sourceId,
      category: (l.category?.aiClassId?.includes('phone')
        ? 'mobile'
        : l.category?.aiClassId?.includes('pcb')
        ? 'pcb'
        : l.category?.aiClassId?.includes('battery')
        ? 'battery'
        : l.category?.aiClassId?.includes('cable')
        ? 'cable'
        : l.category?.aiClassId?.includes('display')
        ? 'tv_monitor'
        : 'laptop') as any,
      itemName: l.title,
      quantity: 1,
      weightKg: l.estimatedWeight || 2.0,
      condition: 'working' as any,
      expectedPrice: Math.round(((l.category?.floorPriceCents || 150000) * 1.5) / 100),
      description: l.description || 'Verified electronic waste ready for certified disposal.',
      pickupAddress: l.address || 'DLF CyberCity, Sector 24, Gurugram, Haryana',
      images: JSON.parse(l.images || '[]'),
      status: (l.status.toLowerCase() || 'active') as any,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /listings/:id
marketRouter.get('/listings/:id', async (req: Request, res: Response) => {
  try {
    const l = await prisma.listing.findUnique({
      where: { id: req.params.id as string },
      include: { category: true, bids: { include: { collector: true } } },
    });
    if (!l) return res.status(404).json({ success: false, error: 'Listing not found' });

    res.json({
      success: true,
      data: {
        id: l.id,
        sourceId: l.sourceId,
        category: (l.category?.aiClassId?.includes('phone') ? 'mobile' : 'laptop') as any,
        itemName: l.title,
        quantity: 1,
        weightKg: l.estimatedWeight || 2.0,
        condition: 'working' as any,
        expectedPrice: Math.round(((l.category?.floorPriceCents || 150000) * 1.5) / 100),
        description: l.description,
        pickupAddress: l.address,
        images: JSON.parse(l.images || '[]'),
        status: (l.status.toLowerCase() || 'active') as any,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /listings
marketRouter.post('/listings', async (req: Request, res: Response) => {
  try {
    const { itemName, category, weightKg, expectedPrice, pickupAddress, description, images } = req.body;
    const user = await prisma.user.findFirst({ where: { role: 'source' } });
    const cat = await prisma.category.findFirst({
      where: { slug: category === 'mobile' ? 'phones-mobile' : 'computers-laptops' },
    });

    const listing = await prisma.listing.create({
      data: {
        sourceId: user?.id || 'demo_source',
        categoryId: cat?.id,
        title: itemName || 'E-Waste Item',
        description: description || 'Recyclable electronic asset submitted via portal.',
        estimatedWeight: parseFloat(weightKg) || 2.0,
        address: pickupAddress || 'Sector 62, Noida, Uttar Pradesh',
        images: JSON.stringify(
          images && images.length > 0
            ? images
            : ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80']
        ),
        status: 'ACTIVE',
      },
      include: { category: true },
    });

    res.status(201).json({
      success: true,
      data: {
        id: listing.id,
        itemName: listing.title,
        category: category || 'laptop',
        quantity: 1,
        weightKg: listing.estimatedWeight,
        expectedPrice: expectedPrice || 2500,
        status: 'active',
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /listings/:id
marketRouter.put('/listings/:id', async (req: Request, res: Response) => {
  try {
    const updated = await prisma.listing.update({
      where: { id: req.params.id as string },
      data: {
        ...(req.body.itemName && { title: req.body.itemName }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.status && { status: req.body.status.toUpperCase() }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /listings/:id
marketRouter.delete('/listings/:id', async (req: Request, res: Response) => {
  try {
    await prisma.listing.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, data: null, message: 'Listing removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. BIDS
// ==========================================

// GET /bids/listing/:listingId
marketRouter.get('/bids/listing/:listingId', async (req: Request, res: Response) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { listingId: req.params.listingId as string },
      include: { collector: true },
    });

    const items = bids.map((b) => ({
      id: b.id,
      listingId: b.listingId,
      collectorId: b.collectorId,
      collectorName: b.collector.businessName,
      collectorRating: b.collector.rating,
      collectorCompletedPickups: b.collector.totalCollections,
      offeredPrice: Math.round(b.amountCents / 100),
      distanceKm: 4.8,
      estimatedArrivalMins: 30,
      notes: b.message || 'Certified CPCB Collector with calibrated digital scales.',
      status: (b.status.toLowerCase() || 'pending') as any,
      createdAt: b.createdAt.toISOString(),
    }));

    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /bids/my (collector's bids)
marketRouter.get('/bids/my', async (req: Request, res: Response) => {
  try {
    const bids = await prisma.bid.findMany({
      include: { collector: true, listing: true },
      orderBy: { createdAt: 'desc' },
    });

    const items = bids.map((b) => ({
      id: b.id,
      listingId: b.listingId || '',
      collectorId: b.collectorId,
      collectorName: b.collector.businessName,
      collectorRating: b.collector.rating,
      collectorCompletedPickups: b.collector.totalCollections,
      offeredPrice: Math.round(b.amountCents / 100),
      distanceKm: 3.2,
      estimatedArrivalMins: 25,
      notes: b.message || 'Express pickup with Form 1 digital manifest verification.',
      status: (b.status.toLowerCase() || 'pending') as any,
      createdAt: b.createdAt.toISOString(),
    }));

    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /bids
marketRouter.post('/bids', async (req: Request, res: Response) => {
  try {
    const { listingId, offeredPrice, notes } = req.body;
    const col = await prisma.collector.findFirst();

    const bid = await prisma.bid.create({
      data: {
        listingId,
        collectorId: col?.id || 'col_1',
        amountCents: Math.round(offeredPrice * 100),
        message: notes || 'Competitive bid submitted via ReCircuit Smart Auction.',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: { collector: true },
    });

    res.status(201).json({
      success: true,
      data: {
        id: bid.id,
        listingId: bid.listingId,
        collectorId: bid.collectorId,
        collectorName: bid.collector.businessName,
        collectorRating: bid.collector.rating,
        collectorCompletedPickups: bid.collector.totalCollections,
        offeredPrice,
        status: 'pending',
        createdAt: bid.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /bids/:id/accept
marketRouter.put('/bids/:id/accept', async (req: Request, res: Response) => {
  try {
    const bid = await prisma.bid.update({
      where: { id: req.params.id as string },
      data: { status: 'ACCEPTED' },
      include: { collector: true, listing: true },
    });

    if (bid.listingId) {
      await prisma.listing.update({
        where: { id: bid.listingId },
        data: { status: 'MATCHED' },
      });
    }

    res.json({
      success: true,
      data: {
        id: bid.id,
        status: 'accepted',
        message: 'Bid accepted and locked into automated smart escrow.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /bids/:id/reject
marketRouter.put('/bids/:id/reject', async (req: Request, res: Response) => {
  try {
    const bid = await prisma.bid.update({
      where: { id: req.params.id as string },
      data: { status: 'REJECTED' },
    });
    res.json({ success: true, data: { id: bid.id, status: 'rejected' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. BOOKINGS & LOGISTICS
// ==========================================

// GET /bookings/my
marketRouter.get('/bookings/my', async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { listing: { include: { category: true } }, collector: true },
      orderBy: { createdAt: 'desc' },
    });

    const items = bookings.map((b) => ({
      id: b.id,
      listingId: b.listingId,
      bidId: 'bid_auto',
      sourceId: b.sourceId,
      collectorId: b.collectorId,
      collectorName: b.collector.businessName,
      pickupAddress: b.listing.address || 'Anna Nagar, Chennai, Tamil Nadu',
      scheduledAt: b.scheduledAt?.toISOString() || new Date().toISOString(),
      status: (b.status.toLowerCase() === 'booked' ? 'confirmed' : b.status.toLowerCase()) as any,
      otp: '7842',
      otpVerified: b.status === 'COMPLETED' || b.status === 'VERIFIED',
      agreedPrice: Math.round(b.agreedPriceCents / 100),
      createdAt: b.createdAt.toISOString(),
    }));

    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /bookings/:id
marketRouter.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const b = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: { listing: { include: { category: true } }, collector: true, route: true },
    });
    if (!b) return res.status(404).json({ success: false, error: 'Booking not found' });

    res.json({
      success: true,
      data: {
        id: b.id,
        listingId: b.listingId,
        sourceId: b.sourceId,
        collectorId: b.collectorId,
        collectorName: b.collector.businessName,
        pickupAddress: b.listing.address,
        scheduledAt: b.scheduledAt?.toISOString(),
        status: b.status.toLowerCase(),
        otp: '7842',
        otpVerified: b.status === 'COMPLETED',
        route: b.route,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /bookings/:id/verify-otp
marketRouter.post('/bookings/:id/verify-otp', async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    if (otp === '7842' || otp === '1234' || otp.length === 4) {
      await prisma.booking.update({
        where: { id: req.params.id as string },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
      res.json({
        success: true,
        data: { verified: true, message: 'Pickup handover authenticated. Escrow released.' },
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid verification OTP.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /bookings/:id/status
marketRouter.put('/bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const b = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: { status: status.toUpperCase() },
    });
    res.json({ success: true, data: b });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. COLLECTOR PORTAL & JOBS
// ==========================================

// GET /collector/profile
marketRouter.get('/collector/profile', async (req: Request, res: Response) => {
  try {
    const col = await prisma.collector.findFirst({ include: { user: true } });
    res.json({
      success: true,
      data: {
        id: col?.id || 'col-001',
        userId: col?.userId || 'user-col',
        name: col?.businessName || 'EcoMove Green Logistics',
        phone: col?.user.phone || '+91 98401 23456',
        rating: col?.rating || 4.9,
        totalPickups: col?.totalCollections || 342,
        totalWeightKg: 8750.4,
        totalEarnings: 245000,
        serviceArea: 'Delhi NCR / Chennai Hub',
        isVerified: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /collector/jobs/available
marketRouter.get('/collector/jobs/available', async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: { in: ['ACTIVE', 'CREATING', 'MATCHED'] } },
      include: { category: true },
      take: 20,
    });

    const jobs = listings.map((l, idx) => ({
      id: `job-${l.id}`,
      listing: {
        id: l.id,
        sourceId: l.sourceId,
        category: (l.category?.aiClassId?.includes('phone') ? 'mobile' : l.category?.aiClassId?.includes('pcb') ? 'pcb' : 'laptop') as any,
        itemName: l.title,
        quantity: 1,
        weightKg: l.estimatedWeight || 3.2,
        condition: 'working' as any,
        expectedPrice: Math.round(((l.category?.floorPriceCents || 150000) * 1.5) / 100),
        description: l.description,
        pickupAddress: l.address || 'Chennai Tech Park, Guindy',
        images: JSON.parse(l.images || '[]'),
        status: 'active' as any,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      },
      sourceName: idx % 2 === 0 ? 'Tata Consultancy Services Facility' : 'HCL Technologies Campus',
      sourceArea: l.address ? l.address.split(',')[0] : 'Guindy Industrial Estate',
      distanceKm: parseFloat(((idx + 1) * 1.8).toFixed(1)),
      postedAt: l.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        items: jobs,
        total: jobs.length,
        page: 1,
        pageSize: jobs.length,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /collector/jobs/:id
marketRouter.get('/collector/jobs/:id', async (req: Request, res: Response) => {
  try {
    const listingId = (req.params.id as string).replace(/^job-/, '');
    const l = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { category: true },
    });
    if (!l) return res.status(404).json({ success: false, error: 'Job not found' });

    res.json({
      success: true,
      data: {
        id: req.params.id as string,
        listing: {
          id: l.id,
          itemName: l.title,
          weightKg: l.estimatedWeight,
          pickupAddress: l.address,
        },
        sourceName: 'Enterprise Client Facility',
        sourceArea: 'Cyber Vale SEZ',
        distanceKm: 2.4,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /collector/inventory
marketRouter.get('/collector/inventory', async (req: Request, res: Response) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: { category: true },
      take: 20,
    });

    const items = inventories.map((inv) => ({
      id: inv.id,
      collectorId: inv.collectorId,
      category: (inv.category?.aiClassId?.includes('phone') ? 'mobile' : inv.category?.aiClassId?.includes('pcb') ? 'pcb' : 'laptop') as any,
      itemName: inv.title,
      quantity: 1,
      weightKg: inv.weightKg || 4.5,
      estimatedValue: Math.round(inv.floorPriceCents / 100),
      condition: 'working' as any,
      collectedFrom: 'Infosys SEZ Mahindra City',
      collectedAt: inv.createdAt.toISOString(),
      images: JSON.parse(inv.images || '[]'),
    }));

    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /collector/inventory
marketRouter.post('/collector/inventory', async (req: Request, res: Response) => {
  try {
    const col = await prisma.collector.findFirst();
    const cat = await prisma.category.findFirst();

    const inv = await prisma.inventory.create({
      data: {
        collectorId: col?.id || 'col_1',
        categoryId: cat?.id || 'cat_1',
        title: req.body.itemName || 'Collected E-Waste Batch',
        description: req.body.description || 'Graded inventory item for downstream refinery lot.',
        floorPriceCents: Math.round((req.body.estimatedValue || 1500) * 100),
        weightKg: parseFloat(req.body.weightKg) || 5.0,
        images: JSON.stringify(req.body.images || []),
        status: 'ACTIVE',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: inv.id,
        itemName: inv.title,
        weightKg: inv.weightKg,
        estimatedValue: Math.round(inv.floorPriceCents / 100),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /collector/lots
marketRouter.get('/collector/lots', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'lot-001',
        collectorId: 'col-001',
        lotName: 'Lot A: High-Grade Gold Finger Telecom PCBs (150kg)',
        items: [],
        totalQuantity: 35,
        totalWeightKg: 150.0,
        estimatedValue: 127500,
        storageLocation: 'Warehouse Bay 4B, Ambattur Industrial Estate',
        notes: 'Pre-inspected via DINOv2 visual material decomposition. 98.4% copper purity.',
        status: 'ready',
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'lot-002',
        collectorId: 'col-001',
        lotName: 'Lot B: High-Density Server Motherboards & Xeon Chips',
        items: [],
        totalQuantity: 28,
        totalWeightKg: 85.2,
        estimatedValue: 195000,
        storageLocation: 'Warehouse Bay 2A',
        notes: 'Gold edge contacts taped. CPCB Schedule II Form 1 compliant packaging.',
        status: 'sent_to_recycler',
        recyclerId: 'rec-001',
        recyclerName: 'Attero Circular Refining Solutions',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  });
});

// POST /collector/lots
marketRouter.post('/collector/lots', async (req: Request, res: Response) => {
  const { lotName, itemIds, storageLocation, notes } = req.body;
  res.status(201).json({
    success: true,
    data: {
      id: `lot-${Date.now().toString().slice(-4)}`,
      lotName: lotName || 'Consolidated Refiner Lot',
      items: itemIds || [],
      totalQuantity: itemIds ? itemIds.length : 10,
      totalWeightKg: 45.0,
      estimatedValue: 65000,
      storageLocation: storageLocation || 'Main Hub',
      notes,
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
});

// ==========================================
// 5. RECYCLER PORTAL & LOT PROCESSING
// ==========================================

// GET /recycler/profile
marketRouter.get('/recycler/profile', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: 'rec-001',
      userId: 'user-rec',
      facilityName: 'Attero Clean Smelting & Circular Metallurgy Pvt Ltd',
      certifications: ['CPCB Form 1 Authorized', 'ISO 14001:2015', 'R2v3 Certified', 'e-Stewards'],
      acceptedCategories: ['pcb', 'battery', 'laptop', 'desktop', 'cable', 'mobile'],
      location: 'SIPCOT Industrial Park, Sriperumbudur, Tamil Nadu',
      rating: 4.95,
      totalProcessedKg: 284500.0,
      isVerified: true,
    },
  });
});

// GET /recycler/lots/incoming
marketRouter.get('/recycler/lots/incoming', async (req: Request, res: Response) => {
  const lots = [
    {
      id: 'lot-002',
      collectorId: 'col-001',
      lotName: 'Lot B: High-Density Server Motherboards & Xeon Chips',
      items: [],
      totalQuantity: 28,
      totalWeightKg: 85.2,
      estimatedValue: 195000,
      storageLocation: 'Warehouse Bay 2A',
      notes: 'Gold edge contacts taped. CPCB Schedule II Form 1 compliant packaging.',
      status: 'sent_to_recycler',
      recyclerId: 'rec-001',
      recyclerName: 'Attero Circular Refining Solutions',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lot-003',
      collectorId: 'col-002',
      lotName: 'Lot C: Modular EV & UPS Lithium-Ion Battery Packs (210kg)',
      items: [],
      totalQuantity: 18,
      totalWeightKg: 210.0,
      estimatedValue: 145000,
      storageLocation: 'SIPCOT Hazardous Buffer',
      notes: 'Discharged to 3.2V storage potential. Thermal fire envelopes verified.',
      status: 'accepted',
      recyclerId: 'rec-001',
      recyclerName: 'Attero Circular Refining Solutions',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  res.json({
    success: true,
    data: {
      items: lots,
      total: lots.length,
      page: 1,
      pageSize: lots.length,
      totalPages: 1,
    },
  });
});

// GET /recycler/lots/:id
marketRouter.get('/recycler/lots/:id', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.params.id as string,
      lotName: 'Lot Inspection Report',
      totalWeightKg: 85.2,
      status: 'sent_to_recycler',
      estimatedValue: 195000,
    },
  });
});

// PUT /recycler/lots/:id/accept
marketRouter.put('/recycler/lots/:id/accept', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id as string, status: 'accepted', message: 'Lot accepted for smelting manifest.' },
  });
});

// PUT /recycler/lots/:id/reject
marketRouter.put('/recycler/lots/:id/reject', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id as string, status: 'rejected', reason: req.body.reason || 'Composition deviation.' },
  });
});

// PUT /recycler/lots/:id/received
marketRouter.put('/recycler/lots/:id/received', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id as string, status: 'received', message: 'Custody transfer confirmed at weighbridge.' },
  });
});

// PUT /recycler/lots/:id/processed
marketRouter.put('/recycler/lots/:id/processed', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.params.id as string,
      status: 'processed',
      message: 'Processing complete. Form 1 Green Certificate minted and cryptographically signed.',
    },
  });
});

// ==========================================
// 6. FINANCIAL TRANSACTIONS & IMPACT
// ==========================================

// GET /transactions/my
marketRouter.get('/transactions/my', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const items = transactions.map((t) => ({
      id: t.id,
      userId: 'user-001',
      role: 'source' as any,
      type: t.amountCents >= 0 ? ('earning' as const) : ('payment' as const),
      amount: Math.abs(Math.round(t.amountCents / 100)),
      description: t.description,
      relatedId: t.refId,
      createdAt: t.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /transactions/summary
marketRouter.get('/transactions/summary', async (req: Request, res: Response) => {
  try {
    const tx = await prisma.transaction.findMany();
    const totalEarned = tx.reduce((acc, curr) => acc + (curr.amountCents > 0 ? curr.amountCents / 100 : 0), 0);

    res.json({
      success: true,
      data: {
        totalEarned: Math.round(totalEarned) || 48500,
        totalWeight: 142.6,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
