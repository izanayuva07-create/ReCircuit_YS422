export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ReCircuit Core API',
    version: '1.0.0',
    description: 'Master Specification v1.0 - Circular E-Waste Logistics & Fulfillment Platform API',
    contact: {
      name: 'ReCircuit Architecture Team',
      email: 'api@recircuit.org',
    },
  },
  servers: [
    { url: 'http://localhost:5050', description: 'Local Development Server' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      IdempotencyHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'Idempotency-Key',
      },
    },
    schemas: {
      Listing: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          status: { type: 'string', enum: ['CREATING', 'AI_CLASSIFYING', 'CONFIRMING', 'ACTIVE', 'MATCHED', 'BOOKED', 'IN_TRANSIT', 'COMPLETED', 'PAID'] },
          aiConfidence: { type: 'number', example: 0.94 },
          aiModelVersion: { type: 'string', example: 'efficientnet-b0-e-waste-v3.2' },
        },
      },
      AIPredictionResponse: {
        type: 'object',
        properties: {
          predictions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                class_id: { type: 'string' },
                confidence: { type: 'number' },
                category_slug: { type: 'string' },
                attributes: { type: 'object' },
              },
            },
          },
          modelVersion: { type: 'string' },
          processingMs: { type: 'number' },
        },
      },
    },
  },
  paths: {
    '/v1/ai/classify': {
      post: {
        summary: 'Run AI vision classification on e-waste image',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', description: 'Image URL or preset identifier' },
                  hint: { type: 'string' },
                },
                required: ['image'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Top-5 classification with confidence and dynamic attributes' },
        },
      },
    },
    '/v1/matching/collectors': {
      get: {
        summary: 'Find ranked collectors via PostGIS spatial and weighted formula',
        parameters: [
          { name: 'lat', in: 'query', schema: { type: 'number' } },
          { name: 'lng', in: 'query', schema: { type: 'number' } },
          { name: 'radius', in: 'query', schema: { type: 'number' } },
        ],
        responses: {
          '200': { description: 'Ranked collectors list' },
        },
      },
    },
    '/v1/source/listings': {
      get: { summary: 'List source listings' },
      post: { summary: 'Create new listing with AI scan' },
    },
    '/v1/collector/inventory': {
      get: { summary: 'List collector inventory items' },
      post: { summary: 'List new inventory item' },
    },
    '/v1/collector/analytics/summary': {
      get: { summary: 'Collector performance KPIs, volume, ranking and earnings' },
    },
    '/v1/admin/analytics/platform': {
      get: { summary: 'Platform-wide high-level metrics and escrow balance' },
    },
    '/v1/admin/transactions': {
      get: { summary: 'Double-entry financial ledger audit trail' },
    },
  },
};
