import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { LedgerService } from './ledger.service.js';

export const paymentsRouter = Router();

// GET /v1/payments/collector/onboard (Stripe Connect link generator)
paymentsRouter.get('/collector/onboard', async (req: Request, res: Response, next) => {
  try {
    const collectorId = req.query.collectorId as string;
    
    // Simulate Stripe Connect express onboarding URL
    const onboardingUrl = `https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=ca_recircuit_sim&scope=read_write&state=${collectorId || 'demo'}`;
    
    res.json({
      url: onboardingUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      provider: 'stripe_connect',
    });
  } catch (error) {
    next(error);
  }
});

// GET /v1/payments/collector/account-status
paymentsRouter.get('/collector/account-status', async (req: Request, res: Response, next) => {
  try {
    const collectorId = (req.query.collectorId as string) || req.user?.collectorId;
    if (!collectorId) {
      return res.status(400).json({ error: 'collectorId required' });
    }

    const collector = await prisma.collector.findUnique({
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
  } catch (error) {
    next(error);
  }
});

// POST /v1/payments/webhook (Simulated Stripe webhooks)
paymentsRouter.post('/webhook', async (req: Request, res: Response, next) => {
  try {
    const event = req.body;
    // Log and handle event
    res.json({ received: true, eventType: event.type || 'payment_intent.succeeded' });
  } catch (error) {
    next(error);
  }
});
