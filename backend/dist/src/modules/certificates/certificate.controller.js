"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificateRouter = void 0;
const express_1 = require("express");
const certificate_service_js_1 = require("./certificate.service.js");
const prisma_js_1 = require("../../lib/prisma.js");
const index_js_1 = require("../../types/index.js");
exports.certificateRouter = (0, express_1.Router)();
// POST /v1/certificates/generate
exports.certificateRouter.post('/generate', async (req, res, next) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) {
            return res.status(400).json({ error: 'bookingId is required to generate certificate.' });
        }
        // Determine requesting user
        let userId = req.user?.id;
        const isAdmin = req.user?.role === index_js_1.Actor.ADMIN;
        if (!userId) {
            // Fallback for interactive testing to the booking's owner
            const b = await prisma_js_1.prisma.booking.findUnique({ where: { id: bookingId } });
            userId = b?.sourceId;
        }
        if (!userId) {
            return res.status(401).json({ error: 'Unauthenticated user' });
        }
        const certificate = await certificate_service_js_1.CertificateService.generateCertificate({
            bookingId,
            requestUserId: userId,
            isAdmin,
        });
        res.status(201).json({
            success: true,
            certificate,
            message: 'Green Recycling Certificate generated and recorded successfully.',
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// GET /v1/certificates (User's certificates)
exports.certificateRouter.get('/', async (req, res, next) => {
    try {
        let userId = req.user?.id;
        if (!userId) {
            // Fallback to demo source user
            const u = await prisma_js_1.prisma.user.findFirst({ where: { role: 'source' } });
            userId = u?.id;
        }
        const certificates = await certificate_service_js_1.CertificateService.getUserCertificates(userId || '');
        res.json({ certificates, count: certificates.length });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/certificates/verify/:certificateId (Public verification endpoint)
exports.certificateRouter.get('/verify/:certificateId', async (req, res, next) => {
    try {
        const { certificateId } = req.params;
        const result = await certificate_service_js_1.CertificateService.verifyCertificate(req.params.certificateId);
        if (result.status === 'CERTIFICATE NOT FOUND') {
            return res.status(404).json(result);
        }
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/certificates/admin/summary
exports.certificateRouter.get('/admin/summary', async (req, res, next) => {
    try {
        const search = req.query.search;
        const status = req.query.status;
        const data = await certificate_service_js_1.CertificateService.getAdminCertificateSummary({ search, status });
        res.json(data);
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/certificates/:certificateId
exports.certificateRouter.get('/:certificateId', async (req, res, next) => {
    try {
        const cert = await certificate_service_js_1.CertificateService.getCertificateById(req.params.certificateId);
        res.json(cert);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
// POST /v1/certificates/:certificateId/revoke (Admin only)
exports.certificateRouter.post('/:certificateId/revoke', async (req, res, next) => {
    try {
        const { reason } = req.body;
        const cert = await certificate_service_js_1.CertificateService.revokeCertificate(req.params.certificateId, reason);
        res.json({ success: true, certificate: cert, message: 'Certificate has been officially revoked.' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
