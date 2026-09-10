"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const index_js_1 = require("../types/index.js");
const errorHandler_js_1 = require("./errorHandler.js");
const prisma_js_1 = require("../lib/prisma.js");
const authenticate = async (req, res, next) => {
    try {
        const roleHeader = req.headers['x-role'] || req.headers['x-user-role'];
        const userIdHeader = req.headers['x-user-id'];
        // Fallback/Demo default user for smooth interactive frontend testing
        let user = null;
        if (userIdHeader) {
            user = await prisma_js_1.prisma.user.findUnique({
                where: { id: userIdHeader },
                include: { collector: true, sourceProfile: true },
            });
        }
        else if (roleHeader) {
            user = await prisma_js_1.prisma.user.findFirst({
                where: { role: roleHeader.toLowerCase() },
                include: { collector: true, sourceProfile: true },
            });
        }
        // Default fallback to first active user if none specified
        if (!user) {
            user = await prisma_js_1.prisma.user.findFirst({
                include: { collector: true, sourceProfile: true },
            });
        }
        if (user) {
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                region: user.region,
                collectorId: user.collector?.id,
                sourceProfileId: user.sourceProfile?.id,
            };
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Unauthenticated request', 401));
        }
        if (!allowedRoles.includes(req.user.role) && req.user.role !== index_js_1.Actor.ADMIN) {
            return next(new errorHandler_js_1.AppError(`Forbidden: Requires role in [${allowedRoles.join(', ')}]`, 403));
        }
        next();
    };
};
exports.requireRole = requireRole;
