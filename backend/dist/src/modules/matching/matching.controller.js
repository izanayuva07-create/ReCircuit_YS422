"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchingRouter = void 0;
const express_1 = require("express");
const matching_service_js_1 = require("./matching.service.js");
exports.matchingRouter = (0, express_1.Router)();
// GET /v1/matching/collectors
exports.matchingRouter.get('/collectors', async (req, res, next) => {
    try {
        const lat = parseFloat(req.query.lat) || 28.6139;
        const lng = parseFloat(req.query.lng) || 77.2090;
        const radius = req.query.radius ? parseFloat(req.query.radius) : 50;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const listingId = req.query.listingId;
        const result = await matching_service_js_1.MatchingService.findMatchingCollectors({
            listingId,
            lat,
            lng,
            radiusKm: radius,
            limit,
        });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
