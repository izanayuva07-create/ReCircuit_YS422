import { Router, Request, Response } from 'express';
import { MatchingService } from './matching.service.js';

export const matchingRouter = Router();

// GET /v1/matching/collectors
matchingRouter.get('/collectors', async (req: Request, res: Response, next) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 28.6139;
    const lng = parseFloat(req.query.lng as string) || 77.2090;
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 50;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const listingId = req.query.listingId as string;

    const result = await MatchingService.findMatchingCollectors({
      listingId,
      lat,
      lng,
      radiusKm: radius,
      limit,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});
