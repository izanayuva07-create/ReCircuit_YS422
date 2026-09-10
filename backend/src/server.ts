import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { idempotency } from './middleware/idempotency.js';

import { aiRouter } from './modules/ai/ai.controller.js';
import { matchingRouter } from './modules/matching/matching.controller.js';
import { sourceRouter } from './modules/source/source.controller.js';
import { collectorRouter } from './modules/collector/collector.controller.js';
import { adminRouter } from './modules/admin/admin.controller.js';
import { paymentsRouter } from './modules/payments/payments.controller.js';
import { certificateRouter } from './modules/certificates/certificate.controller.js';

import { SocketGateway } from './websocket/socket.gateway.js';
import { swaggerSpec } from './docs/swagger.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Gateway
export const socketGateway = new SocketGateway(server);

// Security & Middlewares
app.use(helmet({ contentSecurityPolicy: false })); // allow swagger ui inline assets
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Idempotency & Auth
app.use(idempotency);
app.use(authenticate);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'recircuit-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'ReCircuit Master Backend API',
    version: 'v1.0',
    specification: 'ReCircuit Backend — Master Prompt Specification v1.0',
    documentation: '/docs',
    endpoints: {
      ai: '/v1/ai',
      matching: '/v1/matching',
      source: '/v1/source',
      collector: '/v1/collector',
      admin: '/v1/admin',
      payments: '/v1/payments',
    },
  });
});

// Swagger OpenAPI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import { authRouter } from './modules/auth/auth.controller.js';
import { wasteRouter } from './modules/waste/waste.controller.js';
import { marketRouter } from './modules/market/market.controller.js';

// Mount V1 API Routes
app.use('/v1/ai', aiRouter);
app.use('/v1/matching', matchingRouter);
app.use('/v1/source', sourceRouter);
app.use('/v1/collector', collectorRouter);
app.use('/v1/admin', adminRouter);
app.use('/v1/payments', paymentsRouter);
app.use('/v1/certificates', certificateRouter);

// Frontend compatibility routes (/api/v1 and root mappings)
app.use('/v1/auth', authRouter);
app.use('/api/v1/auth', authRouter);
app.use('/auth', authRouter);

app.use('/v1/waste', wasteRouter);
app.use('/api/v1/waste', wasteRouter);
app.use('/waste', wasteRouter);

app.use('/v1', marketRouter);
app.use('/api/v1', marketRouter);
app.use('/', marketRouter);

// RFC 9457 Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  logger.info(`🚀 ReCircuit Core Backend v1.0 running on http://localhost:${PORT}`);
  logger.info(`📖 Interactive API Documentation at http://localhost:${PORT}/docs`);
  logger.info(`⚡ Socket.io Real-time Gateway active on port ${PORT}`);
});
