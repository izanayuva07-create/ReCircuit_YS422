
-- ReCircuit Master Specification v1.0 - PostGIS & PostgreSQL Extension Schema
-- Compatible with PostgreSQL 16 + PostGIS 3.4

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 7.1 PostGIS Schema & Spatial Columns
-- Collector service area (circle polygon or custom boundary)
ALTER TABLE "Collector" ADD COLUMN IF NOT EXISTS service_area geography(Polygon, 4326);
CREATE INDEX IF NOT EXISTS idx_collectors_service_area ON "Collector" USING GIST (service_area);

-- Listing location (point)
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_listings_location ON "Listing" USING GIST (location);

-- Booking tracking route (linestring + waypoints)
CREATE TABLE IF NOT EXISTS booking_routes (
  booking_id TEXT PRIMARY KEY REFERENCES "Booking"(id) ON DELETE CASCADE,
  route geography(LineString, 4326),
  waypoints geography(Point, 4326)[],
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7.2 Matching Materialized View (Refreshed every 5 min)
CREATE MATERIALIZED VIEW IF NOT EXISTS collector_availability AS
SELECT 
  c.id,
  c."userId",
  ST_SetSRID(ST_MakePoint(c."locationLng", c."locationLat"), 4326)::geography AS location,
  c."serviceRadiusKm",
  c.rating,
  c."totalCollections",
  COUNT(b.id) FILTER (WHERE b.status IN ('CONFIRMED','IN_TRANSIT')) AS active_bookings,
  AVG(CASE WHEN b.status = 'COMPLETED' THEN b."collectorRating" END) AS recent_rating
FROM "Collector" c
LEFT JOIN "Booking" b ON b."collectorId" = c.id AND b."createdAt" > NOW() - INTERVAL '30 days'
WHERE c."kycStatus" = 'APPROVED'
GROUP BY c.id;

CREATE INDEX IF NOT EXISTS idx_collector_availability_loc ON collector_availability USING GIST (location);
