import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export const idempotency = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['idempotency-key'] as string;

  // Optional for simple testing, but cached if provided
  if (!key || !['POST', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  try {
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (existing && existing.expiresAt > new Date() && existing.response) {
      const parsed = JSON.parse(existing.response);
      return res.status(existing.status).json(parsed);
    }

    // Intercept res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      prisma.idempotencyKey.upsert({
        where: { key },
        create: {
          key,
          endpoint: req.originalUrl,
          payload: JSON.stringify(req.body || {}),
          response: JSON.stringify(body),
          status: res.statusCode,
          expiresAt,
        },
        update: {
          response: JSON.stringify(body),
          status: res.statusCode,
        },
      }).catch((e) => console.error('Error storing idempotency key:', e));

      return originalJson(body);
    };

    next();
  } catch (error) {
    next(error);
  }
};
