"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../../lib/prisma.js");
exports.authRouter = (0, express_1.Router)();
// POST /auth/login or /api/v1/auth/login
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        const cleanEmail = email.trim().toLowerCase();
        let user = await prisma_js_1.prisma.user.findFirst({
            where: { email: cleanEmail },
            include: { collector: true, sourceProfile: true },
        });
        if (!user) {
            // Create user if not exists or fallback to existing role user
            const role = cleanEmail.includes('collector') ? 'collector' : cleanEmail.includes('recycler') ? 'recycler' : 'source';
            user = await prisma_js_1.prisma.user.create({
                data: {
                    name: cleanEmail.split('@')[0],
                    email: cleanEmail,
                    role,
                    sourceProfile: role === 'source' ? { create: { defaultAddress: 'New Delhi, India', locationLat: 28.6139, locationLng: 77.2090 } } : undefined,
                    collector: role === 'collector' ? { create: { businessName: 'EcoMove Green Logistics', registrationNumber: 'CPCB-2026-DEL', locationLat: 28.6139, locationLng: 77.2090 } } : undefined,
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
            role: user.role,
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /auth/signup
exports.authRouter.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;
        const cleanEmail = email.trim().toLowerCase();
        let user = await prisma_js_1.prisma.user.findFirst({ where: { email: cleanEmail } });
        if (!user) {
            user = await prisma_js_1.prisma.user.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /auth/me
exports.authRouter.get('/me', async (req, res) => {
    try {
        const user = await prisma_js_1.prisma.user.findFirst({
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// PUT /auth/me
exports.authRouter.put('/me', async (req, res) => {
    try {
        const { name, phone, location, avatar } = req.body;
        const user = await prisma_js_1.prisma.user.findFirst({
            include: { sourceProfile: true },
        });
        if (!user)
            return res.status(404).json({ success: false, error: 'User not found' });
        const updatedUser = await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(avatar && { avatarUrl: avatar }),
            },
            include: { sourceProfile: true },
        });
        if (location && updatedUser.sourceProfile) {
            await prisma_js_1.prisma.sourceProfile.update({
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /auth/logout
exports.authRouter.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});
