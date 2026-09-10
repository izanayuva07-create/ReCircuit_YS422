"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
const prisma_js_1 = require("../../lib/prisma.js");
const environmentalCalculator_js_1 = require("./environmentalCalculator.js");
class CertificateService {
    static BASE_URL = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
    /**
     * Generates a unique, official Green Recycling Certificate for a completed transaction.
     */
    static async generateCertificate(params) {
        const { bookingId, requestUserId, isAdmin = false } = params;
        // 1. Fetch real booking record with listing, user, and collector
        const booking = await prisma_js_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                listing: { include: { category: true } },
                collector: { include: { user: true } },
            },
        });
        if (!booking) {
            throw new Error(`Booking with ID ${bookingId} not found.`);
        }
        // 2. Validate transaction status
        if (booking.status !== 'COMPLETED') {
            throw new Error(`Certificate can only be issued for COMPLETED recycling transactions. Current status is ${booking.status}.`);
        }
        // 3. Security: validate user ownership
        if (!isAdmin && booking.sourceId !== requestUserId) {
            // If requestUserId doesn't match booking.sourceId directly, check if the booking's sourceId matches user id
            const user = await prisma_js_1.prisma.user.findUnique({ where: { id: requestUserId } });
            if (!user || (user.id !== booking.sourceId && user.role !== 'admin')) {
                throw new Error('Unauthorized: You can only generate certificates for your own recycling transactions.');
            }
        }
        // 4. Duplicate prevention (unique constraint guard on transactionId)
        const existing = await prisma_js_1.prisma.certificate.findUnique({
            where: { transactionId: booking.id },
        });
        if (existing) {
            return existing; // Idempotently return already generated certificate
        }
        // 5. Fetch real recipient user details
        const recipientUser = await prisma_js_1.prisma.user.findUnique({
            where: { id: booking.sourceId },
            include: { sourceProfile: true },
        });
        const userFullName = recipientUser?.name || 'ReCircuit Recycling Contributor';
        // 6. Generate sequential Certificate ID (e.g. RC-EWR-2026-000101)
        const count = await prisma_js_1.prisma.certificate.count();
        const certificateId = `RC-EWR-2026-${String(count + 1).padStart(6, '0')}`;
        const verificationToken = crypto_1.default.randomBytes(16).toString('hex');
        const verificationUrl = `${this.BASE_URL}/verify/${certificateId}`;
        // 7. Generate Real Scannable QR Code Data URL
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(verificationUrl, {
            errorCorrectionLevel: 'M',
            margin: 1,
            color: {
                dark: '#064e3b', // Deep forest green
                light: '#ffffff',
            },
            width: 220,
        });
        // 8. Environmental Impact Calculation
        const weightKg = booking.listing?.estimatedWeight || 2.5;
        const categorySlug = booking.listing?.category?.slug || 'computers-laptops';
        const envImpact = environmentalCalculator_js_1.EnvironmentalCalculatorService.calculate(weightKg, categorySlug);
        // 9. Persist Certificate record to Database
        const certificate = await prisma_js_1.prisma.certificate.create({
            data: {
                certificateId,
                userId: booking.sourceId,
                transactionId: booking.id,
                bookingId: booking.id,
                eWasteId: booking.listingId,
                partnerId: booking.collectorId,
                certificateStatus: 'VERIFIED',
                userNameSnapshot: userFullName,
                wasteType: booking.listing?.category?.name || 'Consumer Electronics',
                wasteCategory: booking.listing?.category?.slug || 'computers-laptops',
                itemName: booking.listing?.title || 'Certified E-Waste Recycling Lot',
                quantity: 1,
                weightKg,
                collectionDate: booking.completedAt || booking.scheduledAt || new Date(),
                issueDate: new Date(),
                collectionLocation: booking.listing?.address || recipientUser?.sourceProfile?.defaultAddress || 'Verified Collection Hub, New Delhi',
                collectionMethod: booking.fulfillmentType || 'PICKUP',
                recyclingMethod: 'Refining, Component Recovery & Zero-Landfill Dismantling',
                processingStatus: 'COMPLETED',
                materialsRecoveredKg: envImpact.materialsRecoveredKg,
                co2ReductionKg: envImpact.co2ReductionKg,
                materialsBreakdown: JSON.stringify(envImpact.materialsBreakdown),
                verificationToken,
                verificationUrl,
                qrCodeDataUrl,
            },
        });
        return certificate;
    }
    /**
     * Fetch all certificates for a user.
     */
    static async getUserCertificates(userId) {
        return prisma_js_1.prisma.certificate.findMany({
            where: { userId },
            orderBy: { issueDate: 'desc' },
        });
    }
    /**
     * Fetch a single certificate by certificate ID.
     */
    static async getCertificateById(certificateId) {
        const cert = await prisma_js_1.prisma.certificate.findUnique({
            where: { certificateId },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
        if (!cert) {
            throw new Error(`Certificate ${certificateId} not found.`);
        }
        return cert;
    }
    /**
     * Public Verification Endpoint: Returns sanitized non-PII certificate verification details.
     */
    static async verifyCertificate(certificateId) {
        const cert = await prisma_js_1.prisma.certificate.findUnique({
            where: { certificateId },
        });
        if (!cert) {
            return {
                status: 'CERTIFICATE NOT FOUND',
                isValid: false,
                message: 'No verified e-waste recycling certificate exists with this identification number.',
            };
        }
        if (cert.certificateStatus === 'REVOKED') {
            return {
                status: 'CERTIFICATE REVOKED',
                isValid: false,
                certificateId: cert.certificateId,
                revokedAt: cert.revokedAt,
                revocationReason: cert.revocationReason || 'Administrative audit revocation.',
                message: 'This recycling certificate was officially revoked and is no longer recognized.',
            };
        }
        // Fetch partner public business name
        const collector = await prisma_js_1.prisma.collector.findUnique({
            where: { id: cert.partnerId },
        });
        // Sanitized public fields (NO phone, email, address, or payment data)
        return {
            status: 'CERTIFICATE VERIFIED',
            isValid: true,
            certificateId: cert.certificateId,
            recipientName: cert.userNameSnapshot,
            eWasteType: cert.wasteType,
            category: cert.wasteCategory,
            itemName: cert.itemName,
            quantity: cert.quantity,
            weightKg: cert.weightKg,
            collectionDate: cert.collectionDate,
            issueDate: cert.issueDate,
            recyclingPartner: collector?.businessName || 'GreenCycle Eco-Solutions Pvt Ltd',
            processingStatus: cert.processingStatus,
            materialsRecoveredKg: cert.materialsRecoveredKg,
            co2ReductionKg: cert.co2ReductionKg,
            isCo2Estimated: true,
            materialsBreakdown: cert.materialsBreakdown ? JSON.parse(cert.materialsBreakdown) : [],
            verificationUrl: cert.verificationUrl,
        };
    }
    /**
     * Admin: Revoke a certificate with mandatory reason.
     */
    static async revokeCertificate(certificateId, reason) {
        const cert = await prisma_js_1.prisma.certificate.findUnique({ where: { certificateId } });
        if (!cert)
            throw new Error(`Certificate ${certificateId} not found.`);
        return prisma_js_1.prisma.certificate.update({
            where: { certificateId },
            data: {
                certificateStatus: 'REVOKED',
                revokedAt: new Date(),
                revocationReason: reason || 'Revoked per compliance audit requirement.',
            },
        });
    }
    /**
     * Admin summary statistics and certificate browser.
     */
    static async getAdminCertificateSummary(params) {
        const { search, status } = params;
        const where = {};
        if (status && status !== 'ALL') {
            where.certificateStatus = status;
        }
        if (search) {
            where.OR = [
                { certificateId: { contains: search } },
                { userNameSnapshot: { contains: search } },
                { transactionId: { contains: search } },
                { itemName: { contains: search } },
            ];
        }
        const certificates = await prisma_js_1.prisma.certificate.findMany({
            where,
            orderBy: { issueDate: 'desc' },
            take: 100,
        });
        const totalCertificates = await prisma_js_1.prisma.certificate.count();
        const activeCertificates = await prisma_js_1.prisma.certificate.count({ where: { certificateStatus: 'VERIFIED' } });
        const revokedCertificates = await prisma_js_1.prisma.certificate.count({ where: { certificateStatus: 'REVOKED' } });
        const allCerts = await prisma_js_1.prisma.certificate.findMany({
            select: { weightKg: true, co2ReductionKg: true, materialsRecoveredKg: true },
        });
        const totalWeightKg = parseFloat(allCerts.reduce((acc, c) => acc + (c.weightKg || 0), 0).toFixed(2));
        const totalCo2ReducedKg = parseFloat(allCerts.reduce((acc, c) => acc + (c.co2ReductionKg || 0), 0).toFixed(2));
        const totalMaterialsRecoveredKg = parseFloat(allCerts.reduce((acc, c) => acc + (c.materialsRecoveredKg || 0), 0).toFixed(2));
        return {
            stats: {
                totalCertificates,
                activeCertificates,
                revokedCertificates,
                totalWeightKg,
                totalCo2ReducedKg,
                totalMaterialsRecoveredKg,
            },
            certificates,
        };
    }
}
exports.CertificateService = CertificateService;
