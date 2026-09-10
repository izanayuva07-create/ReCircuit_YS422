"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketGateway = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const logger_js_1 = require("./lib/logger.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const auth_js_1 = require("./middleware/auth.js");
const idempotency_js_1 = require("./middleware/idempotency.js");
const ai_controller_js_1 = require("./modules/ai/ai.controller.js");
const matching_controller_js_1 = require("./modules/matching/matching.controller.js");
const source_controller_js_1 = require("./modules/source/source.controller.js");
const collector_controller_js_1 = require("./modules/collector/collector.controller.js");
const admin_controller_js_1 = require("./modules/admin/admin.controller.js");
const payments_controller_js_1 = require("./modules/payments/payments.controller.js");
const certificate_controller_js_1 = require("./modules/certificates/certificate.controller.js");
const socket_gateway_js_1 = require("./websocket/socket.gateway.js");
const swagger_js_1 = require("./docs/swagger.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Initialize WebSocket Gateway
exports.socketGateway = new socket_gateway_js_1.SocketGateway(server);
// Security & Middlewares
app.use((0, helmet_1.default)({ contentSecurityPolicy: false })); // allow swagger ui inline assets
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Idempotency & Auth
app.use(idempotency_js_1.idempotency);
app.use(auth_js_1.authenticate);
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
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_js_1.swaggerSpec));
const auth_controller_js_1 = require("./modules/auth/auth.controller.js");
const waste_controller_js_1 = require("./modules/waste/waste.controller.js");
const market_controller_js_1 = require("./modules/market/market.controller.js");
// Mount V1 API Routes
app.use('/v1/ai', ai_controller_js_1.aiRouter);
app.use('/v1/matching', matching_controller_js_1.matchingRouter);
app.use('/v1/source', source_controller_js_1.sourceRouter);
app.use('/v1/collector', collector_controller_js_1.collectorRouter);
app.use('/v1/admin', admin_controller_js_1.adminRouter);
app.use('/v1/payments', payments_controller_js_1.paymentsRouter);
app.use('/v1/certificates', certificate_controller_js_1.certificateRouter);
// Frontend compatibility routes (/api/v1 and root mappings)
app.use('/v1/auth', auth_controller_js_1.authRouter);
app.use('/api/v1/auth', auth_controller_js_1.authRouter);
app.use('/auth', auth_controller_js_1.authRouter);
app.use('/v1/waste', waste_controller_js_1.wasteRouter);
app.use('/api/v1/waste', waste_controller_js_1.wasteRouter);
app.use('/waste', waste_controller_js_1.wasteRouter);
app.use('/v1', market_controller_js_1.marketRouter);
app.use('/api/v1', market_controller_js_1.marketRouter);
app.use('/', market_controller_js_1.marketRouter);
// RFC 9457 Global Error Handler
app.use(errorHandler_js_1.errorHandler);
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
    logger_js_1.logger.info(`🚀 ReCircuit Core Backend v1.0 running on http://localhost:${PORT}`);
    logger_js_1.logger.info(`📖 Interactive API Documentation at http://localhost:${PORT}/docs`);
    logger_js_1.logger.info(`⚡ Socket.io Real-time Gateway active on port ${PORT}`);
});
