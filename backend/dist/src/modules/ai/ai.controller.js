"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const ai_service_js_1 = require("./ai.service.js");
const prisma_js_1 = require("../../lib/prisma.js");
exports.aiRouter = (0, express_1.Router)();
// POST /v1/ai/classify (Single image classification)
exports.aiRouter.post('/classify', async (req, res, next) => {
    try {
        const { image, hint } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image URL or payload is required' });
        }
        const result = await ai_service_js_1.AIService.classifyImage(image, hint);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// POST /v1/ai/classify/batch (Multiple images max 5)
exports.aiRouter.post('/classify/batch', async (req, res, next) => {
    try {
        const { images } = req.body;
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: 'Images array is required (max 5)' });
        }
        const clamped = images.slice(0, 5);
        const results = await Promise.all(clamped.map(img => ai_service_js_1.AIService.classifyImage(img)));
        res.json({ results, count: results.length });
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/ai/categories (Taxonomy tree)
exports.aiRouter.get('/categories', async (req, res, next) => {
    try {
        const dbCategories = await prisma_js_1.prisma.category.findMany({
            where: { active: true },
        });
        if (dbCategories.length > 0) {
            return res.json(dbCategories);
        }
        // Fallback to in-memory taxonomy
        res.json(ai_service_js_1.AIService.getTaxonomy());
    }
    catch (error) {
        next(error);
    }
});
// GET /v1/ai/categories/:id/attributes (Dynamic attributes schema)
exports.aiRouter.get('/categories/:id/attributes', async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await prisma_js_1.prisma.category.findFirst({
            where: { OR: [{ id: id }, { slug: id }, { aiClassId: id }] },
        });
        if (!category) {
            const taxonomyMatch = ai_service_js_1.AIService.getTaxonomy().find(t => t.class_id === id || t.slug === id);
            if (taxonomyMatch) {
                return res.json({
                    class_id: taxonomyMatch.class_id,
                    attributes: taxonomyMatch.attributes,
                });
            }
            return res.status(404).json({ error: 'Category not found' });
        }
        const attrs = category.attributesSchema ? JSON.parse(category.attributesSchema) : {};
        res.json({
            categoryId: category.id,
            slug: category.slug,
            attributes: attrs,
        });
    }
    catch (error) {
        next(error);
    }
});
