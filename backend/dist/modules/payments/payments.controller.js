"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../../lib/prisma.js");
exports.paymentsRouter = (0, express_1.Router)();
// GET /v1/payments/collector/onboard (Stripe Connect link generator)
exports.paymentsRouter.get('/collector/onboard', async (req, res, next) => {
    try {
        const collectorId = req.query.collectorId;
        // Simulate Stripe Connect express onboarding URL
        const onboardingUrl = `https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=ca_recircuit_sim&scope=read_write&state=${collectorId || 'demo'}`;
        res.json({
            url: onboardingUrl,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            provider: 'stripe_connect',
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/payments/collector/account-status
exports.paymentsRouter.get('/collector/account-status', async (req, res, next) => {
    try {
        const collectorId = req.query.collectorId || req.user?.collectorId;
        if (!collectorId) {
            return res.status(400).json({ error: 'collectorId required' });
        }
        const collector = await prisma_js_1.prisma.collector.findUnique({
            where: { id: collectorId },
            include: { payoutMethods: true },
        });
        if (!collector) {
            return res.status(404).json({ error: 'Collector not found' });
        }
        res.json({
            collectorId: collector.id,
            kycStatus: collector.kycStatus,
            payoutsEnabled: collector.kycStatus === 'APPROVED',
            chargesEnabled: true,
            payoutSchedule: 'WEEKLY',
            defaultCurrency: 'INR',
            payoutMethods: collector.payoutMethods,
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/payments/webhook (Simulated Stripe webhooks)
exports.paymentsRouter.post('/webhook', async (req, res, next) => {
    try {
        const event = req.body;
        // Log and handle event
        res.json({ received: true, eventType: event.type || 'payment_intent.succeeded' });
    }
    catch (error) {
        next(error);
    }
});
