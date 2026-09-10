import { Request, Response, NextFunction } from 'express';
import { Actor, AuthenticatedUser } from '../types/index.js';
import { AppError } from './errorHandler.js';
import { prisma } from '../lib/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleHeader = (req.headers['x-role'] as string) || (req.headers['x-user-role'] as string);
    const userIdHeader = (req.headers['x-user-id'] as string);

    // Fallback/Demo default user for smooth interactive frontend testing
    let user = null;

    if (userIdHeader) {
      user = await prisma.user.findUnique({
        where: { id: userIdHeader },
        include: { collector: true, sourceProfile: true },
      });
    } else if (roleHeader) {
      user = await prisma.user.findFirst({
        where: { role: roleHeader.toLowerCase() },
        include: { collector: true, sourceProfile: true },
      });
    }

    // Default fallback to first active user if none specified
    if (!user) {
      user = await prisma.user.findFirst({
        include: { collector: true, sourceProfile: true },
      });
    }

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Actor,
        region: user.region,
        collectorId: user.collector?.id,
        sourceProfileId: user.sourceProfile?.id,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: Actor[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthenticated request', 401));
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== Actor.ADMIN) {
      return next(new AppError(`Forbidden: Requires role in [${allowedRoles.join(', ')}]`, 403));
    }

    next();
  };
};
