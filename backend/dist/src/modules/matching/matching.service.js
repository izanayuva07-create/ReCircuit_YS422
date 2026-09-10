"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const constants_js_1 = require("../../lib/constants.js");
class MatchingService {
    // Haversine formula to compute great-circle distance between two points in km
    static calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(2));
    }
    // §7.2 Matching Query implementation with ranking weights
    static async findMatchingCollectors(params) {
        const maxRadius = Math.min(params.radiusKm || 50, constants_js_1.BUSINESS_RULES.MAX_COLLECTOR_RADIUS_KM);
        const limit = params.limit || 10;
        // Fetch approved collectors with active status
        const dbCollectors = await prisma_js_1.prisma.collector.findMany({
            where: {
                kycStatus: 'APPROVED',
            },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'IN_TRANSIT'] },
                    },
                },
            },
        });
        // Compute metrics for each collector
        const scoredList = [];
        for (const c of dbCollectors) {
            const distance = this.calculateDistanceKm(params.lat, params.lng, c.locationLat, c.locationLng);
            // Filter within service radius
            if (distance <= c.serviceRadiusKm && distance <= maxRadius) {
                const activeBookings = c.bookings.length;
                const availabilityScore = Math.max(0, 1 - activeBookings / 10);
                const priceScore = 0.85; // Standard high-value baseline or bid ratio
                const proximityScore = Math.max(0, 1 - distance / c.serviceRadiusKm);
                const ratingScore = Math.min(1.0, (c.rating || 4.5) / 5.0);
                // §7.2 Formula weights: 35% Rating, 25% Price, 25% Distance, 15% Availability
                const compositeScore = parseFloat((0.35 * ratingScore +
                    0.25 * priceScore +
                    0.25 * proximityScore +
                    0.15 * availabilityScore).toFixed(3));
                // Estimate ETA assuming average urban transit speed (25 km/h) + 10 mins buffer
                const etaMinutes = Math.max(10, Math.round((distance / 25) * 60) + 5);
                scoredList.push({
                    collectorId: c.id,
                    businessName: c.businessName,
                    rating: c.rating,
                    totalCollections: c.totalCollections,
                    distanceKm: distance,
                    serviceRadiusKm: c.serviceRadiusKm,
                    priceScore,
                    availabilityScore,
                    compositeScore,
                    etaMinutes,
                    coordinates: {
                        lat: c.locationLat,
                        lng: c.locationLng,
                    },
                    kycStatus: c.kycStatus,
                });
            }
        }
        // Sort descending by composite score
        scoredList.sort((a, b) => b.compositeScore - a.compositeScore);
        return {
            collectors: scoredList.slice(0, limit),
            algorithmVersion: 'recircuit-postgis-ranker-v1.4',
            weights: {
                rating: 0.35,
                price: 0.25,
                proximity: 0.25,
                availability: 0.15,
            },
        };
    }
}
exports.MatchingService = MatchingService;
