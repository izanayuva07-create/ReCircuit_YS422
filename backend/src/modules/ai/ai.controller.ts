import { Router, Request, Response } from 'express';
import { AIService } from './ai.service.js';
import { prisma } from '../../lib/prisma.js';

export const aiRouter = Router();

// POST /v1/ai/classify (Single image classification)
aiRouter.post('/classify', async (req: Request, res: Response, next) => {
  try {
    const { image, hint } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image URL or payload is required' });
    }

    const result = await AIService.classifyImage(image, hint);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /v1/ai/classify/batch (Multiple images max 5)
aiRouter.post('/classify/batch', async (req: Request, res: Response, next) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required (max 5)' });
    }

    const clamped = images.slice(0, 5);
    const results = await Promise.all(clamped.map(img => AIService.classifyImage(img)));
    res.json({ results, count: results.length });
  } catch (error) {
    next(error);
  }
});

// GET /v1/ai/categories (Taxonomy tree)
aiRouter.get('/categories', async (req: Request, res: Response, next) => {
  try {
    const dbCategories = await prisma.category.findMany({
      where: { active: true },
    });

    if (dbCategories.length > 0) {
      return res.json(dbCategories);
    }

    // Fallback to in-memory taxonomy
    res.json(AIService.getTaxonomy());
  } catch (error) {
    next(error);
  }
});

// GET /v1/ai/categories/:id/attributes (Dynamic attributes schema)
aiRouter.get('/categories/:id/attributes', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findFirst({
      where: { OR: [{ id: id as string }, { slug: id as string }, { aiClassId: id as string }] },
    });

    if (!category) {
      const taxonomyMatch = AIService.getTaxonomy().find(t => t.class_id === id || t.slug === id);
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
  } catch (error) {
    next(error);
  }
});
