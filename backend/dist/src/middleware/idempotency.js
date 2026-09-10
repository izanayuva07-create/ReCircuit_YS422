"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotency = void 0;
const prisma_js_1 = require("../lib/prisma.js");
const idempotency = async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    // Optional for simple testing, but cached if provided
    if (!key || !['POST', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }
    try {
        const existing = await prisma_js_1.prisma.idempotencyKey.findUnique({
            where: { key },
        });
        if (existing && existing.expiresAt > new Date() && existing.response) {
            const parsed = JSON.parse(existing.response);
            return res.status(existing.status).json(parsed);
        }
        // Intercept res.json to cache response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            prisma_js_1.prisma.idempotencyKey.upsert({
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
    }
    catch (error) {
        next(error);
    }
};
exports.idempotency = idempotency;
