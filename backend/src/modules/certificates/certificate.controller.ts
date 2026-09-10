import { Router, Request, Response } from 'express';
import { CertificateService } from './certificate.service.js';
import { prisma } from '../../lib/prisma.js';
import { Actor } from '../../types/index.js';

export const certificateRouter = Router();

// POST /v1/certificates/generate
certificateRouter.post('/generate', async (req: Request, res: Response, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required to generate certificate.' });
    }

    // Determine requesting user
    let userId = req.user?.id;
    const isAdmin = req.user?.role === Actor.ADMIN;

    if (!userId) {
      // Fallback for interactive testing to the booking's owner
      const b = await prisma.booking.findUnique({ where: { id: bookingId } });
      userId = b?.sourceId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated user' });
    }

    const certificate = await CertificateService.generateCertificate({
      bookingId,
      requestUserId: userId,
      isAdmin,
    });

    res.status(201).json({
      success: true,
      certificate,
      message: 'Green Recycling Certificate generated and recorded successfully.',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /v1/certificates (User's certificates)
certificateRouter.get('/', async (req: Request, res: Response, next) => {
  try {
    let userId = req.user?.id;
    if (!userId) {
      // Fallback to demo source user
      const u = await prisma.user.findFirst({ where: { role: 'source' } });
      userId = u?.id;
    }

    const certificates = await CertificateService.getUserCertificates(userId || '');
    res.json({ certificates, count: certificates.length });
  } catch (error) {
    next(error);
  }
});

// GET /v1/certificates/verify/:certificateId (Public verification endpoint)
certificateRouter.get('/verify/:certificateId', async (req: Request, res: Response, next) => {
  try {
    const { certificateId } = req.params;
    const result = await CertificateService.verifyCertificate(req.params.certificateId as string);
    
    if (result.status === 'CERTIFICATE NOT FOUND') {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /v1/certificates/admin/summary
certificateRouter.get('/admin/summary', async (req: Request, res: Response, next) => {
  try {
    const search = req.query.search as string;
    const status = req.query.status as string;

    const data = await CertificateService.getAdminCertificateSummary({ search, status });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /v1/certificates/:certificateId
certificateRouter.get('/:certificateId', async (req: Request, res: Response, next) => {
  try {
    const cert = await CertificateService.getCertificateById(req.params.certificateId as string);
    res.json(cert);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// POST /v1/certificates/:certificateId/revoke (Admin only)
certificateRouter.post('/:certificateId/revoke', async (req: Request, res: Response, next) => {
  try {
    const { reason } = req.body;
    const cert = await CertificateService.revokeCertificate(req.params.certificateId as string, reason);
    res.json({ success: true, certificate: cert, message: 'Certificate has been officially revoked.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
