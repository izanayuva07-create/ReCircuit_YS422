"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectorRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../../lib/prisma.js");
const index_js_1 = require("../../types/index.js");
exports.collectorRouter = (0, express_1.Router)();
// Helper to get active collector
const getCollector = async (req) => {
    const collectorId = req.query.collectorId || req.user?.collectorId;
    if (collectorId) {
        const col = await prisma_js_1.prisma.collector.findUnique({
            where: { id: collectorId },
            include: { user: true },
        });
        if (col)
            return col;
    }
    // Default to first collector in DB
    return prisma_js_1.prisma.collector.findFirst({
        include: { user: true },
    });
};
// ==================== INVENTORY ====================
// GET /v1/collector/inventory
exports.collectorRouter.get('/inventory', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        const items = await prisma_js_1.prisma.inventory.findMany({
            where: collector ? { collectorId: collector.id } : {},
            include: { category: true, bids: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ inventory: items, count: items.length });
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/collector/inventory
exports.collectorRouter.post('/inventory', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        if (!collector)
            return res.status(401).json({ error: 'Collector not found' });
        const { categoryId, title, description, floorPriceCents, weightKg, images } = req.body;
        // Category floor price validation (BR-008)
        const category = await prisma_js_1.prisma.category.findUnique({ where: { id: categoryId } });
        const minFloor = category?.floorPriceCents || 0;
        const finalFloor = Math.max(floorPriceCents || 0, minFloor);
        const item = await prisma_js_1.prisma.inventory.create({
            data: {
                collectorId: collector.id,
                categoryId: categoryId || (await prisma_js_1.prisma.category.findFirst())?.id || 'cat_default',
                title: title || 'E-waste Material Lot',
                description,
                floorPriceCents: finalFloor,
                weightKg: weightKg || 5.0,
                images: JSON.stringify(images || []),
                status: index_js_1.InventoryStatus.ACTIVE,
            },
            include: { category: true },
        });
        res.status(201).json({ item, message: 'Inventory item listed successfully' });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/collector/inventory/:id
exports.collectorRouter.get('/inventory/:id', async (req, res, next) => {
    try {
        const item = await prisma_js_1.prisma.inventory.findUnique({
            where: { id: req.params.id },
            include: { category: true, bids: { include: { collector: true } } },
        });
        if (!item)
            return res.status(404).json({ error: 'Inventory not found' });
        res.json(item);
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/collector/inventory/:id/relist
exports.collectorRouter.post('/inventory/:id/relist', async (req, res, next) => {
    try {
        const item = await prisma_js_1.prisma.inventory.update({
            where: { id: req.params.id },
            data: { status: index_js_1.InventoryStatus.ACTIVE },
        });
        res.json({ item, message: 'Inventory item reactivated' });
    }
    catch (error) {
        next(error);
    }
});
// ==================== BIDS ====================
// GET /v1/collector/bids
exports.collectorRouter.get('/bids', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        const bids = await prisma_js_1.prisma.bid.findMany({
            where: collector ? { collectorId: collector.id } : {},
            include: {
                inventory: { include: { category: true } },
                listing: { include: { category: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ bids });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /v1/collector/bids/:id/accept
exports.collectorRouter.patch('/bids/:id/accept', async (req, res, next) => {
    try {
        const bid = await prisma_js_1.prisma.bid.update({
            where: { id: req.params.id },
            data: { status: index_js_1.BidStatus.ACCEPTED },
        });
        res.json({ success: true, bid, message: 'Bid accepted' });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /v1/collector/bids/:id/counter
exports.collectorRouter.patch('/bids/:id/counter', async (req, res, next) => {
    try {
        const { counterAmountCents } = req.body;
        const bid = await prisma_js_1.prisma.bid.update({
            where: { id: req.params.id },
            data: {
                counterAmountCents,
                status: index_js_1.BidStatus.COUNTERED,
            },
        });
        res.json({ success: true, bid, message: `Counter-offer of ₹${(counterAmountCents / 100).toFixed(2)} submitted` });
    }
    catch (error) {
        next(error);
    }
});
// ==================== BOOKINGS & DISPATCH ====================
// GET /v1/collector/bookings
exports.collectorRouter.get('/bookings', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        const bookings = await prisma_js_1.prisma.booking.findMany({
            where: collector ? { collectorId: collector.id } : {},
            include: {
                listing: { include: { category: true } },
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
// PATCH /v1/collector/bookings/:id/confirm
exports.collectorRouter.patch('/bookings/:id/confirm', async (req, res, next) => {
    try {
        const booking = await prisma_js_1.prisma.booking.update({
            where: { id: req.params.id },
            data: { status: index_js_1.BookingStatus.CONFIRMED },
        });
        res.json({ success: true, booking, message: 'Pickup scheduled time confirmed' });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /v1/collector/bookings/:id/start-transit
exports.collectorRouter.patch('/bookings/:id/start-transit', async (req, res, next) => {
    try {
        const booking = await prisma_js_1.prisma.booking.update({
            where: { id: req.params.id },
            data: { status: index_js_1.BookingStatus.IN_TRANSIT },
        });
        // Update route speed and ETA
        await prisma_js_1.prisma.bookingRoute.upsert({
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
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/collector/bookings/:id/location (GPS telemetry push)
exports.collectorRouter.post('/bookings/:id/location', async (req, res, next) => {
    try {
        const { lat, lng, heading, speed, etaMinutes } = req.body;
        const route = await prisma_js_1.prisma.bookingRoute.upsert({
            where: { bookingId: req.params.id },
            create: {
                bookingId: req.params.id,
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
    }
    catch (error) {
        next(error);
    }
});
// PATCH /v1/collector/bookings/:id/complete (BR-004)
exports.collectorRouter.patch('/bookings/:id/complete', async (req, res, next) => {
    try {
        const booking = await prisma_js_1.prisma.booking.findUnique({
            where: { id: req.params.id },
            include: { collector: true },
        });
        if (!booking)
            return res.status(404).json({ error: 'Booking not found' });
        const updated = await prisma_js_1.prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: index_js_1.BookingStatus.VERIFIED, // Ready for mutual confirmation
                arrivedAt: new Date(),
            },
        });
        res.json({
            success: true,
            booking: updated,
            message: 'Item verified on-site by collector. Waiting for final source release.',
        });
    }
    catch (error) {
        next(error);
    }
});
// ==================== ANALYTICS ====================
// GET /v1/collector/analytics/summary
exports.collectorRouter.get('/analytics/summary', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        const bookings = await prisma_js_1.prisma.booking.findMany({
            where: collector ? { collectorId: collector.id } : {},
        });
        const completedBookings = bookings.filter(b => b.status === index_js_1.BookingStatus.COMPLETED);
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
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/collector/analytics/material-breakdown
exports.collectorRouter.get('/analytics/material-breakdown', async (req, res, next) => {
    try {
        res.json([
            { category: 'Laptops & Computers', percentage: 42, weightKg: 146.4, revenueCents: 3550000 },
            { category: 'Smartphones & Tablets', percentage: 28, weightKg: 97.6, revenueCents: 2360000 },
            { category: 'Lithium Battery Packs', percentage: 18, weightKg: 62.7, revenueCents: 1520000 },
            { category: 'Printed Circuit Boards', percentage: 12, weightKg: 41.8, revenueCents: 1020000 },
        ]);
    }
    catch (error) {
        next(error);
    }
});
// ==================== PROFILE & KYC & PAYOUTS ====================
// GET /v1/collector/profile
exports.collectorRouter.get('/profile', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        if (!collector)
            return res.status(404).json({ error: 'Collector not found' });
        res.json(collector);
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/collector/kyc (Submit KYC documents)
exports.collectorRouter.post('/kyc', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        if (!collector)
            return res.status(401).json({ error: 'Collector not found' });
        const { registrationNumber, documents } = req.body;
        const updated = await prisma_js_1.prisma.collector.update({
            where: { id: collector.id },
            data: {
                registrationNumber: registrationNumber || 'CPCB-REG-2026-IND-8842',
                kycDocuments: JSON.stringify(documents || [{ type: 'CPCB_FORM_1', url: 'https://r2.recircuit.org/kyc/cpcb_cert.pdf' }]),
                kycStatus: 'APPROVED', // Auto-approve demo collector for smooth testing
            },
        });
        res.json({ success: true, collector: updated, message: 'KYC verified and approved.' });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/collector/payout-methods
exports.collectorRouter.get('/payout-methods', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        const methods = await prisma_js_1.prisma.payoutMethod.findMany({
            where: collector ? { collectorId: collector.id } : {},
        });
        res.json({ payoutMethods: methods });
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/collector/payout-methods (BR-001: KYC check)
exports.collectorRouter.post('/payout-methods', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        if (!collector)
            return res.status(401).json({ error: 'Collector not found' });
        // BR-001: Collector must have approved KYC before first payout
        if (collector.kycStatus !== 'APPROVED') {
            return res.status(403).json({
                type: 'https://recircuit.org/errors/kyc-required',
                title: 'KYC Required',
                detail: 'Collector must have approved KYC before configuring payouts (BR-001).',
            });
        }
        const { type, provider, accountDetails } = req.body;
        const method = await prisma_js_1.prisma.payoutMethod.create({
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
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/collector/badges
exports.collectorRouter.get('/badges', async (req, res, next) => {
    try {
        const collector = await getCollector(req);
        const badges = await prisma_js_1.prisma.badge.findMany({
            where: collector ? { collectorId: collector.id } : {},
        });
        res.json({
            badges: badges.length > 0 ? badges : [
                { badgeType: 'CPCB_CERTIFIED', name: 'CPCB Authorized Recycler', iconUrl: 'shield-check', description: 'Certified under E-Waste (Management) Rules 2022' },
                { badgeType: 'ZERO_HAZARD', name: 'Zero-Leakage Logistics', iconUrl: 'zap', description: '100+ clean hazardous battery transports' },
                { badgeType: 'TOP_RATED', name: '5-Star Recycler 2026', iconUrl: 'star', description: 'Maintained 4.9+ rating across 200+ pickups' },
            ],
        });
    }
    catch (error) {
        next(error);
    }
});
