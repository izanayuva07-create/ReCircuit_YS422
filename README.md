# ⚡ ReCircuit — Unified Master Architecture & 3D Platform

> **Intelligent, 3D-First, AI-Powered Circular E-Waste Logistics & Fulfillment Platform**  
> Built strictly according to the **ReCircuit Backend Master Prompt Specification v1.0** and the **3D-First Frontend Specification**.

---

## 🌟 Executive Overview

ReCircuit is an end-to-end circular economy platform connecting **Sources** (households and enterprises disposing of e-waste) with **Collectors** (registered and authorized recycling facilities). It leverages real-time AI vision classification, PostGIS-based spatial matching, dual-mode logistics fulfillment with live GPS telemetry, an immutable double-entry financial ledger with escrow protection, and a futuristic dark-mode 3D interface built with React Three Fiber.

---

## 🏗️ System Architecture & Sector Coverage

| Sector | Prompt Section | Implementation Details |
|---|---|---|
| **Core Domain & State Machines** | §1 | Listing, Inventory, and Booking dual-mode fulfillment state machines |
| **Data Architecture & Modeling** | §2 | 18+ Prisma models, PostgreSQL 16 + PostGIS 3.4 schema, SQLite zero-friction local fallback |
| **API Design & Contracts** | §3 | REST API v1 (`/v1/*`), RFC 9457 Problem Details, Idempotency keys, OpenAPI / Swagger UI at `/docs` |
| **AI/ML Vision Pipeline** | §4 | `efficientnet-b0-e-waste-v3.2` model, top-5 predictions, dynamic attributes, confidence threshold fallback (<0.60) |
| **Payments & Financial Ledger** | §5 | Immutable double-entry bookkeeping (`ESCROW_HOLD`, `ESCROW_RELEASE`, `PLATFORM_FEE`), 10% commission, Stripe Connect simulation |
| **Real-Time & Telemetry** | §6 | Socket.io gateway with `/source`, `/collector`, `/admin` rooms, live GPS coordinate streaming |
| **Geospatial & Logistics** | §7 | Weighted PostGIS query (35% rating, 25% price, 25% proximity, 15% availability), vehicle dispatch |
| **Auth, Security & Compliance** | §8 | RBAC (`SOURCE`, `COLLECTOR`, `ADMIN`), Helmet security headers, CPCB & EU WEEE regulatory rules |
| **3D Frontend (R3F & Three.js)** | Frontend | `EarthParticles` planetary flow, `ARClassifierOverlay` HUD, `InventoryGalaxy` streams, `ImpactForest` CO2 sequestering |

---

## 🎨 3D Frontend Experiences (React Three Fiber)

1. **`EarthParticles` (Planetary Hero)**
   - GPU-accelerated 3D sphere of 2,800+ glittering particles (Neon Cyan, Neon Lime, Gold, Copper) with orbital rings and continuous pointer tilt.
2. **`ARClassifierOverlay` (AI Scanner HUD)**
   - 3D wireframe bounding box, octagonal target reticles, and sweeping laser scan line simulating computer vision inference.
3. **`InventoryGalaxy` (Collector Stream Radar)**
   - Instanced 3D celestial nodes representing physical lots of Gold PCBs, LiFePO4 packs, Bare Copper, and Rare Earths.
4. **`ImpactForest` (Decarbonization Simulation)**
   - Procedural low-poly glowing trees with upward-floating carbon sequestration particles.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v10+

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies (including Three.js & R3F)
cd ../frontend
npm install --legacy-peer-deps
```

### 3. Seed the Master Database
```bash
cd ../backend
npm run seed
```
*Seeds CPCB authorized collectors, EU WEEE taxonomies, test listings, and initializes the double-entry ledger.*

### 4. Run Automated Test Suite
```bash
npm test
```
*Executes 12 unit tests validating AI classification, PostGIS composite ranking, double-entry escrow settlement, and ledger balance integrity.*

### 5. Launch the Full-Stack Application
From the workspace root:
```bash
npm run dev
```
Or start individually:
- **Backend**: `npm --prefix backend run dev` (running on `http://localhost:5050`)
- **Frontend**: `npm --prefix frontend run dev` (running on `http://localhost:5173`)
- **Swagger API Docs**: `http://localhost:5050/docs`

---

## 📜 Business Rules Catalog (Enforced in Code)

- **BR-001**: Collector must have approved KYC before payout methods can be configured.
- **BR-002**: Bids automatically expire after 24 hours.
- **BR-003**: 10% platform commission held in escrow on booking creation.
- **BR-004**: Escrow release requires mutual confirmation or administrative mediation.
- **BR-005**: Bidirectional ratings allowed strictly after status reaches `COMPLETED`.
- **BR-006**: Collector service radius capped at $\le 100\text{ km}$.
- **BR-007**: Sources can have at most 5 concurrent active listings.
- **BR-008**: Bids validated to meet or exceed category floor prices.
- **BR-009**: 48-hour dispute window post-completion.
- **BR-010**: Daily gamification badges auto-awarded upon milestone achievements.

---

## 🧪 Double-Entry Ledger Verification Example

```typescript
// Source books ₹4,500 pickup:
[Source Wallet]      ESCROW_HOLD     -₹4,500.00
[Platform Escrow]    ESCROW_HOLD     +₹4,500.00

// On mutual completion & verification:
[Platform Escrow]    ESCROW_RELEASE  -₹4,500.00
[Collector Wallet]   ESCROW_RELEASE  +₹4,050.00  (90% payout)
[Platform Treasury]  PLATFORM_FEE    +₹450.00    (10% fee)
```

Verified with zero-drift: $\sum \Delta\text{Balance} = 0$.
