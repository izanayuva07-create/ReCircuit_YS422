"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasteRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../../lib/prisma.js");
const ai_service_js_1 = require("../ai/ai.service.js");
exports.wasteRouter = (0, express_1.Router)();
// POST /waste/analyze — Dual YOLOv8 + DINOv2 Deep Inference
exports.wasteRouter.post('/analyze', async (req, res) => {
    try {
        const imageUrl = req.body.imageUrl ||
            req.body.image ||
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80';
        const hint = req.body.hint || req.body.category || 'laptop';
        const aiResult = await ai_service_js_1.AIService.classifyImage(imageUrl, hint);
        const detectedCategory = aiResult.topPrediction.class_id.includes('phone')
            ? 'mobile'
            : aiResult.topPrediction.class_id.includes('pcb')
                ? 'pcb'
                : aiResult.topPrediction.class_id.includes('battery')
                    ? 'battery'
                    : aiResult.topPrediction.class_id.includes('cable')
                        ? 'cable'
                        : 'laptop';
        const materialTypes = aiResult.topPrediction.attributes?.precious_metals || [
            'Gold (Au)',
            'Copper (Cu)',
            'Aluminum (Al)',
            'Lithium (Li)',
            'Rare Earth Neodymium (Nd)',
        ];
        const estimatedFloor = aiResult.topPrediction.attributes?.estimated_weight_kg
            ? Math.round(aiResult.topPrediction.attributes.estimated_weight_kg * 800)
            : 1500;
        res.json({
            success: true,
            data: {
                detectedCategory,
                detectedItems: [
                    aiResult.topPrediction.category_name,
                    ...aiResult.yolov8Detections.map((d) => `${d.label} (${Math.round(d.confidence * 100)}%)`),
                ],
                condition: 'working',
                materialTypes,
                estimatedPriceMin: Math.round(estimatedFloor * 0.85),
                estimatedPriceMax: Math.round(estimatedFloor * 2.2),
                confidenceScore: Math.round(aiResult.topPrediction.confidence * 100),
                safetyWarnings: aiResult.topPrediction.attributes?.hazard_level === 'CRITICAL'
                    ? [
                        'CRITICAL: Contains high-capacity Lithium battery cells. Store in fire-retardant container.',
                        'Mandatory CPCB Hazardous Waste Rule Handling (Form 1 Manifest).',
                    ]
                    : [
                        'Do not dismantle manually. Contains lead solder and flame-retardant epoxy.',
                        'Ensure electronic serial tags are recorded prior to handover.',
                    ],
                isLoading: false,
                // Dual-Engine Deep Inspection Data
                aiEngines: {
                    yolov8: {
                        model: 'Ultralytics YOLOv8x-EWaste-Segmenter-v1.4',
                        detectedCount: aiResult.yolov8Detections.length,
                        components: aiResult.yolov8Detections,
                    },
                    dinov2: {
                        model: aiResult.dinov2Analysis.modelVersion,
                        backbone: aiResult.dinov2Analysis.backbone,
                        embeddingDim: aiResult.dinov2Analysis.embeddingDimension,
                        featureSample: aiResult.dinov2Analysis.embeddingSummary,
                        materialDecomposition: aiResult.dinov2Analysis.materialDecomposition,
                        salvageTier: aiResult.dinov2Analysis.circularSalvageTier,
                        recyclabilityIndex: aiResult.dinov2Analysis.recyclabilityIndex,
                        compliance: aiResult.dinov2Analysis.regulatoryCompliance,
                    },
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /waste/categories
exports.wasteRouter.get('/categories', async (req, res) => {
    res.json({
        success: true,
        data: [
            'mobile',
            'laptop',
            'desktop',
            'tablet',
            'battery',
            'pcb',
            'cable',
            'appliance',
            'tv_monitor',
            'printer',
            'other',
        ],
    });
});
// GET /waste/listings (public feed for collectors)
exports.wasteRouter.get('/listings', async (req, res) => {
    try {
        const listings = await prisma_js_1.prisma.listing.findMany({
            include: { category: true, bids: { include: { collector: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const items = listings.map((l) => ({
            id: l.id,
            sourceId: l.sourceId,
            category: (l.category?.aiClassId?.includes('phone')
                ? 'mobile'
                : l.category?.aiClassId?.includes('pcb')
                    ? 'pcb'
                    : l.category?.aiClassId?.includes('battery')
                        ? 'battery'
                        : l.category?.aiClassId?.includes('cable')
                            ? 'cable'
                            : l.category?.aiClassId?.includes('display')
                                ? 'tv_monitor'
                                : 'laptop'),
            itemName: l.title,
            quantity: 1,
            weightKg: l.estimatedWeight || 2.0,
            condition: 'working',
            expectedPrice: Math.round(((l.category?.floorPriceCents || 150000) * 1.5) / 100),
            description: l.description || 'Verified circular electronic scrap ready for pickup.',
            pickupAddress: l.address || 'DLF CyberCity, Sector 24, Gurugram, Haryana',
            images: JSON.parse(l.images || '[]'),
            status: (l.status.toLowerCase() || 'active'),
            createdAt: l.createdAt.toISOString(),
            updatedAt: l.updatedAt.toISOString(),
        }));
        res.json({
            success: true,
            data: {
                items,
                total: items.length,
                page: 1,
                pageSize: items.length,
                totalPages: 1,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
