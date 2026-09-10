import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

export const authRouter = Router();

// POST /auth/login or /api/v1/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetRole: string = req.body.role || (
      cleanEmail.includes('collector') ? 'collector' :
      (cleanEmail.includes('recycler') || cleanEmail.includes('disposer')) ? 'recycler' : 'source'
    );

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { role: targetRole }
        ]
      },
      include: { collector: true, sourceProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: targetRole,
          sourceProfile: targetRole === 'source' ? { create: { defaultAddress: '18, 4th Avenue, Anna Nagar, Chennai', locationLat: 13.0827, locationLng: 80.2707 } } : undefined,
          collector: targetRole === 'collector' ? { create: { businessName: 'EcoMove Green Logistics', registrationNumber: 'CPCB-2026-DEL', locationLat: 28.6139, locationLng: 77.2090 } } : undefined,
        },
        include: { collector: true, sourceProfile: true },
      });
    }

    const token = `rc_token_${user.id}_${Date.now()}`;
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '+91 98765 43210',
      role: targetRole || user.role,
      avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      location: user.sourceProfile?.defaultAddress || 'Sector 62, Noida, Uttar Pradesh',
      createdAt: user.createdAt.toISOString(),
    };

    res.json({
      success: true,
      data: {
        token,
        user: userPayload,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /auth/signup
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    let user = await prisma.user.findFirst({ where: { email: cleanEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: phone || '+91 98765 43210',
          role: role || 'source',
        },
        include: { collector: true, sourceProfile: true },
      });
    }

    const token = `rc_token_${user.id}_${Date.now()}`;
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /auth/me
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      include: { collector: true, sourceProfile: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'No user found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        role: user.role,
        avatar: user.avatarUrl,
        location: user.sourceProfile?.defaultAddress || 'Delhi, India',
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /auth/me
authRouter.put('/me', async (req: Request, res: Response) => {
  try {
    const { name, phone, location, avatar } = req.body;
    const user = await prisma.user.findFirst({
      include: { sourceProfile: true },
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatarUrl: avatar }),
      },
      include: { sourceProfile: true },
    });

    if (location && updatedUser.sourceProfile) {
      await prisma.sourceProfile.update({
        where: { id: updatedUser.sourceProfile.id },
        data: { defaultAddress: location },
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatarUrl,
        location: location || updatedUser.sourceProfile?.defaultAddress,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
