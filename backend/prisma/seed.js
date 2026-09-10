"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const certificate_service_js_1 = require("../src/modules/certificates/certificate.service.js");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding ReCircuit Master Specification Database with 20 Comprehensive Items...');
    // 1. Clean existing records
    await prisma.certificate.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.bookingRoute.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.category.deleteMany();
    await prisma.payoutMethod.deleteMany();
    await prisma.collector.deleteMany();
    await prisma.sourceProfile.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    await prisma.featureFlag.deleteMany();
    // 2. Users & Profiles
    const adminUser = await prisma.user.create({
        data: {
            name: 'ReCircuit Admin & Treasury',
            email: 'admin@recircuit.org',
            role: 'admin',
            region: 'IN',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
    });
    const sourceUser = await prisma.user.create({
        data: {
            name: 'Priya Sharma (TechLogix Corp)',
            email: 'source@example.com',
            role: 'source',
            region: 'IN',
            phone: '+91 98401 54321',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            sourceProfile: {
                create: {
                    defaultAddress: '18, 4th Avenue, Anna Nagar, Chennai, Tamil Nadu',
                    locationLat: 13.0827,
                    locationLng: 80.2707,
                },
            },
        },
    });
    const collectorUser1 = await prisma.user.create({
        data: {
            name: 'EcoMove Green Logistics',
            email: 'collector@example.com',
            role: 'collector',
            region: 'IN',
            avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
            collector: {
                create: {
                    businessName: 'EcoMove Green Logistics Pvt Ltd',
                    registrationNumber: 'CPCB-REG-2024-TN-0492',
                    serviceRadiusKm: 60.0,
                    locationLat: 28.6139,
                    locationLng: 77.2090,
                    rating: 4.95,
                    totalCollections: 342,
                    kycStatus: 'APPROVED',
                    kycDocuments: JSON.stringify([
                        { title: 'CPCB Authorization Certificate Form 1', validUntil: '2028-12-31' },
                        { title: 'Hazardous Battery Handling License', validUntil: '2027-06-30' },
                    ]),
                },
            },
        },
        include: { collector: true },
    });
    const collectorUser2 = await prisma.user.create({
        data: {
            name: 'Suresh E-Waste Services',
            email: 'suresh@ewasteservices.in',
            role: 'collector',
            region: 'IN',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            collector: {
                create: {
                    businessName: 'Suresh Circular Metallurgy & Recovery Hub',
                    registrationNumber: 'CPCB-REG-2025-TN-1120',
                    serviceRadiusKm: 60.0,
                    locationLat: 28.4595,
                    locationLng: 77.0266, // Gurugram Hub
                    rating: 4.78,
                    totalCollections: 184,
                    kycStatus: 'APPROVED',
                },
            },
        },
        include: { collector: true },
    });
    const recyclerUser = await prisma.user.create({
        data: {
            name: 'Attero Circular Refining Solutions',
            email: 'recycler@example.com',
            role: 'recycler',
            region: 'IN',
            phone: '+91 94440 98765',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        },
    });
    // 3. Wallets
    await prisma.wallet.create({ data: { userId: sourceUser.id, balanceCents: 1540000 } });
    await prisma.wallet.create({ data: { userId: collectorUser1.id, balanceCents: 0 } });
    await prisma.wallet.create({ data: { userId: adminUser.id, balanceCents: 0 } });
    // 4. Categories
    const catLaptop = await prisma.category.create({
        data: {
            slug: 'computers-laptops',
            name: 'Laptops & Notebooks',
            aiClassId: 'laptop',
            avgMarketPriceCents: 450000,
            floorPriceCents: 150000,
            eprDetails: 'Schedule I - Item code: ITEW2',
        },
    });
    const catPhone = await prisma.category.create({
        data: {
            slug: 'phones-mobile',
            name: 'Smartphones & Mobile Devices',
            aiClassId: 'phone',
            avgMarketPriceCents: 180000,
            floorPriceCents: 50000,
            eprDetails: 'Schedule I - Item code: ITEW15',
        },
    });
    const catPCB = await prisma.category.create({
        data: {
            slug: 'components-pcb',
            name: 'High-Grade Telecom PCBs',
            aiClassId: 'pcb_motherboard',
            avgMarketPriceCents: 85000,
            floorPriceCents: 30000,
            eprDetails: 'Non-ferrous precious metal recovery Grade A',
        },
    });
    const catBattery = await prisma.category.create({
        data: {
            slug: 'batteries-lithium',
            name: 'Lithium-Ion / LiFePO4 Battery Packs',
            aiClassId: 'battery_liion',
            avgMarketPriceCents: 120000,
            floorPriceCents: 40000,
            eprDetails: 'Battery Waste Management Rules 2022',
        },
    });
    const catCable = await prisma.category.create({
        data: {
            slug: 'cables-copper',
            name: 'Insulated Copper Transmission Cables',
            aiClassId: 'wires_cables',
            avgMarketPriceCents: 40000,
            floorPriceCents: 15000,
            eprDetails: 'CPCB Approved Mechanical Granulation',
        },
    });
    const catDisplay = await prisma.category.create({
        data: {
            slug: 'displays-tv',
            name: 'Commercial LED & 4K Digital Signage',
            aiClassId: 'tv_monitor',
            avgMarketPriceCents: 120000,
            floorPriceCents: 35000,
            eprDetails: 'Schedule I - Item code: ITEW5',
        },
    });
    const catDesktop = await prisma.category.create({
        data: {
            slug: 'desktops-workstations',
            name: 'Enterprise Servers & Tower Workstations',
            aiClassId: 'desktop',
            avgMarketPriceCents: 1500000,
            floorPriceCents: 500000,
            eprDetails: 'Schedule I - Item code: ITEW1',
        },
    });
    const catTablet = await prisma.category.create({
        data: {
            slug: 'tablets',
            name: 'Tablets & Touch Screen Displays',
            aiClassId: 'tablet',
            avgMarketPriceCents: 140000,
            floorPriceCents: 45000,
            eprDetails: 'Schedule I - Item code: ITEW16',
        },
    });
    const catAppliance = await prisma.category.create({
        data: {
            slug: 'appliances-solar',
            name: 'Industrial Solar Inverters & UPS Cores',
            aiClassId: 'appliance',
            avgMarketPriceCents: 850000,
            floorPriceCents: 250000,
            eprDetails: 'Schedule I - Item code: CEEW1',
        },
    });
    const catPrinter = await prisma.category.create({
        data: {
            slug: 'printers-peripherals',
            name: 'High-Volume Commercial Plotters & Printers',
            aiClassId: 'printer',
            avgMarketPriceCents: 320000,
            floorPriceCents: 80000,
            eprDetails: 'Schedule I - Item code: ITEW6',
        },
    });
    const catOther = await prisma.category.create({
        data: {
            slug: 'networking-other',
            name: 'Managed Core Switches & Networking Gear',
            aiClassId: 'other',
            avgMarketPriceCents: 650000,
            floorPriceCents: 200000,
            eprDetails: 'Schedule I - Item code: ITEW3',
        },
    });
    // 5. 20 Rich Diverse Realistic E-Waste Items
    const itemsList = [
        {
            title: 'Dell PowerEdge R740 2U Server Blade (Dual Xeon 64-Core)',
            cat: catDesktop,
            img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
            weight: 18.5,
            status: 'MATCHED',
            classId: 'desktop',
            price: 18500,
            yolo: [{ label: 'Motherboard PCB', conf: 0.98 }, { label: 'Copper Heatsinks', conf: 0.96 }],
            dino: { goldYield: 3.4, copperPurity: 24.5, recyclability: 96.2 },
        },
        {
            title: 'ThinkPad T480 Corporate Fleet - Core i7 16GB (Backlight Short)',
            cat: catLaptop,
            img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
            weight: 1.8,
            status: 'BOOKED',
            classId: 'laptop',
            price: 4500,
            yolo: [{ label: 'Logic Board', conf: 0.97 }, { label: 'Li-ion Battery', conf: 0.94 }],
            dino: { goldYield: 1.8, copperPurity: 18.0, recyclability: 93.5 },
        },
        {
            title: 'Batch of 30 Swollen Li-ion Laptop Batteries (Fire Hazard Insulated)',
            cat: catBattery,
            img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
            weight: 8.5,
            status: 'ACTIVE',
            classId: 'battery_liion',
            price: 2800,
            yolo: [{ label: 'Lithium Cell Array', conf: 0.96 }, { label: 'BMS Controller', conf: 0.92 }],
            dino: { goldYield: 0.1, copperPurity: 9.5, recyclability: 89.0 },
        },
        {
            title: 'Telecom Baseband Gold-Finger Motherboards (High Precious Yield)',
            cat: catPCB,
            img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
            weight: 12.0,
            status: 'COMPLETED',
            classId: 'pcb_motherboard',
            price: 15400,
            yolo: [{ label: 'Gold Finger Edge Pins', conf: 0.99 }, { label: 'BGA Chipset', conf: 0.95 }],
            dino: { goldYield: 5.2, copperPurity: 26.4, recyclability: 98.4 },
        },
        {
            title: 'Heavy Duty Insulated Bare Bright Copper Transmission Cables (85kg)',
            cat: catCable,
            img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
            weight: 85.0,
            status: 'ACTIVE',
            classId: 'wires_cables',
            price: 34000,
            yolo: [{ label: 'Annealed Copper Core', conf: 0.98 }, { label: 'PVC Sheath', conf: 0.92 }],
            dino: { goldYield: 0.0, copperPurity: 99.4, recyclability: 99.2 },
        },
        {
            title: 'Commercial Apple iPad Pro & Air Mixed Tablet Lot (15 units)',
            cat: catTablet,
            img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
            weight: 7.2,
            status: 'ACTIVE',
            classId: 'tablet',
            price: 8500,
            yolo: [{ label: 'Retina Display', conf: 0.95 }, { label: 'Logic Board', conf: 0.96 }],
            dino: { goldYield: 2.1, copperPurity: 16.2, recyclability: 94.0 },
        },
        {
            title: 'Mixed Enterprise Smartphones (iPhone, Samsung Galaxy, Pixel - 50 units)',
            cat: catPhone,
            img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
            weight: 10.5,
            status: 'ACTIVE',
            classId: 'phone',
            price: 12500,
            yolo: [{ label: 'Micro Logic Board', conf: 0.98 }, { label: 'NMC Battery', conf: 0.95 }],
            dino: { goldYield: 3.8, copperPurity: 14.8, recyclability: 96.5 },
        },
        {
            title: '3-Phase Industrial Solar Inverter Core with Heavy Copper Coils (140kg)',
            cat: catAppliance,
            img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
            weight: 140.0,
            status: 'ACTIVE',
            classId: 'appliance',
            price: 48000,
            yolo: [{ label: 'Transformer Windings', conf: 0.97 }, { label: 'IGBT Modules', conf: 0.93 }],
            dino: { goldYield: 0.4, copperPurity: 88.0, recyclability: 97.0 },
        },
        {
            title: 'Commercial 4K 55-inch Digital Signage LED Backlight Panels (4 units)',
            cat: catDisplay,
            img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
            weight: 38.0,
            status: 'ACTIVE',
            classId: 'tv_monitor',
            price: 6500,
            yolo: [{ label: 'LED Driver Board', conf: 0.94 }, { label: 'Aluminum Frame', conf: 0.92 }],
            dino: { goldYield: 0.6, copperPurity: 12.0, recyclability: 91.5 },
        },
        {
            title: 'High-Volume Commercial LaserJet Print Engine & Toner Core (26kg)',
            cat: catPrinter,
            img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
            weight: 26.0,
            status: 'ACTIVE',
            classId: 'printer',
            price: 3800,
            yolo: [{ label: 'Stepper Motors', conf: 0.93 }, { label: 'Interface PCB', conf: 0.95 }],
            dino: { goldYield: 0.8, copperPurity: 15.4, recyclability: 89.2 },
        },
        {
            title: 'Cisco Catalyst 9300 48-Port Gigabit Core Switches (3 units)',
            cat: catOther,
            img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
            weight: 16.5,
            status: 'ACTIVE',
            classId: 'other',
            price: 9500,
            yolo: [{ label: 'Gold Contact Ports', conf: 0.98 }, { label: 'High Reliability PCB', conf: 0.97 }],
            dino: { goldYield: 4.2, copperPurity: 22.1, recyclability: 97.4 },
        },
        {
            title: 'Modular 48V 30Ah LiFePO4 E-Mobility Battery Packs (4 units, 68kg)',
            cat: catBattery,
            img: 'https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=800&q=80',
            weight: 68.0,
            status: 'ACTIVE',
            classId: 'battery_liion',
            price: 24000,
            yolo: [{ label: 'Prismatic LFP Cells', conf: 0.96 }, { label: 'BMS Shunt Resistors', conf: 0.93 }],
            dino: { goldYield: 0.2, copperPurity: 8.4, recyclability: 90.5 },
        },
        {
            title: 'Data Center SAS Solid State Drives & Enterprise 15K RPM HDDs (40 units)',
            cat: catOther,
            img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
            weight: 18.2,
            status: 'ACTIVE',
            classId: 'other',
            price: 11200,
            yolo: [{ label: 'Neodymium Magnets', conf: 0.97 }, { label: 'Controller Board', conf: 0.95 }],
            dino: { goldYield: 2.8, copperPurity: 19.4, recyclability: 98.1 },
        },
        {
            title: 'NVIDIA RTX & Tesla GPU Accelerator Compute Blades (6 units)',
            cat: catPCB,
            img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
            weight: 9.6,
            status: 'ACTIVE',
            classId: 'pcb_motherboard',
            price: 21000,
            yolo: [{ label: 'GPU BGA Die Sockets', conf: 0.99 }, { label: 'Vapor Chamber Copper', conf: 0.96 }],
            dino: { goldYield: 6.5, copperPurity: 32.0, recyclability: 98.9 },
        },
        {
            title: 'High-Purity Copper Transformer Windings from Substation UPS (95kg)',
            cat: catCable,
            img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            weight: 95.0,
            status: 'ACTIVE',
            classId: 'wires_cables',
            price: 39500,
            yolo: [{ label: 'Electrolytic Copper Busbar', conf: 0.98 }, { label: 'Nomex Insulation', conf: 0.91 }],
            dino: { goldYield: 0.0, copperPurity: 99.8, recyclability: 99.6 },
        },
        {
            title: 'Hospital Blood Analyzer & Centrifuge Precision Electronic Modules (7.5kg)',
            cat: catAppliance,
            img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
            weight: 7.5,
            status: 'ACTIVE',
            classId: 'appliance',
            price: 6800,
            yolo: [{ label: 'Silver Solder Circuit', conf: 0.95 }, { label: 'Optical Transducers', conf: 0.92 }],
            dino: { goldYield: 3.1, copperPurity: 17.5, recyclability: 94.2 },
        },
        {
            title: 'Commercial Legacy CRT Oscilloscope & Display Terminals (24kg)',
            cat: catDisplay,
            img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
            weight: 24.0,
            status: 'ACTIVE',
            classId: 'tv_monitor',
            price: 2400,
            yolo: [{ label: 'Funnel Lead Glass', conf: 0.94 }, { label: 'Deflection Yoke Copper', conf: 0.93 }],
            dino: { goldYield: 0.2, copperPurity: 11.2, recyclability: 84.0 },
        },
        {
            title: 'Industrial Robotic PLC Automation Controller Modules (8 units, 14.5kg)',
            cat: catOther,
            img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
            weight: 14.5,
            status: 'ACTIVE',
            classId: 'other',
            price: 8800,
            yolo: [{ label: 'Relay Output Banks', conf: 0.96 }, { label: 'CPU Daughterboard', conf: 0.94 }],
            dino: { goldYield: 2.2, copperPurity: 18.0, recyclability: 95.0 },
        },
        {
            title: 'Corporate Dell UltraSharp 27-inch IPS Monitors (10 units, 45kg)',
            cat: catDisplay,
            img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
            weight: 45.0,
            status: 'ACTIVE',
            classId: 'tv_monitor',
            price: 7500,
            yolo: [{ label: 'IPS Panel Glass', conf: 0.95 }, { label: 'Power Supply Board', conf: 0.93 }],
            dino: { goldYield: 0.9, copperPurity: 14.2, recyclability: 92.8 },
        },
        {
            title: 'Defective Apple MacBook Pro Logic Boards with M1/M2 Processors (18 units)',
            cat: catPCB,
            img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
            weight: 4.2,
            status: 'ACTIVE',
            classId: 'pcb_motherboard',
            price: 16800,
            yolo: [{ label: 'M-Series Unified Memory Die', conf: 0.99 }, { label: 'Gold Solder Pads', conf: 0.98 }],
            dino: { goldYield: 7.2, copperPurity: 28.5, recyclability: 98.7 },
        },
    ];
    const createdListings = [];
    for (const item of itemsList) {
        const l = await prisma.listing.create({
            data: {
                sourceId: sourceUser.id,
                categoryId: item.cat.id,
                title: item.title,
                description: `Verified circular e-waste listing. Inspected via Ultralytics YOLOv8x component segmentation and Meta DINOv2 self-supervised visual material decomposition.`,
                images: JSON.stringify([item.img]),
                status: item.status,
                aiPredictions: JSON.stringify({
                    class_id: item.classId,
                    yolov8Detections: item.yolo,
                    dinov2Analysis: item.dino,
                }),
                aiConfidence: 0.96,
                aiModelVersion: 'Dual-Engine: YOLOv8x-EWaste + Meta DINOv2-ViT-B/14',
                extractedAttrs: JSON.stringify({
                    estimated_value_inr: item.price,
                    gold_yield_gpt: item.dino.goldYield,
                    copper_purity_pct: item.dino.copperPurity,
                    recyclability_score: item.dino.recyclability,
                }),
                locationLat: 13.0827,
                locationLng: 80.2707,
                address: '18, 4th Avenue, Anna Nagar, Chennai, Tamil Nadu',
                estimatedWeight: item.weight,
            },
        });
        createdListings.push(l);
    }
    // 6. Seed Competing Bids
    const listing1 = createdListings[0];
    const listing2 = createdListings[1];
    const listing3 = createdListings[2];
    const bid1 = await prisma.bid.create({
        data: {
            listingId: listing1.id,
            collectorId: collectorUser1.collector.id,
            amountCents: 1850000,
            status: 'ACCEPTED',
            expiresAt: new Date(Date.now() + 24 * 3600000),
            message: 'Certified CPCB Collector with calibrated digital scales & immediate escrow lock.',
        },
    });
    await prisma.bid.create({
        data: {
            listingId: listing1.id,
            collectorId: collectorUser2.collector.id,
            amountCents: 1720000,
            status: 'REJECTED',
            expiresAt: new Date(Date.now() + 12 * 3600000),
            message: 'Standard recovery pickup.',
        },
    });
    const bid2 = await prisma.bid.create({
        data: {
            listingId: listing2.id,
            collectorId: collectorUser1.collector.id,
            amountCents: 450000,
            status: 'ACCEPTED',
            expiresAt: new Date(Date.now() + 24 * 3600000),
            message: 'Protected antistatic container pickup scheduled within 2 hours.',
        },
    });
    await prisma.bid.create({
        data: {
            listingId: listing3.id,
            collectorId: collectorUser1.collector.id,
            amountCents: 290000,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 24 * 3600000),
            message: 'Dedicated thermal hazard safety packaging for swollen lithium batteries.',
        },
    });
    // 7. Seed Bookings & Live Route Telemetry
    const booking1 = await prisma.booking.create({
        data: {
            listingId: listing2.id,
            collectorId: collectorUser1.collector.id,
            sourceId: sourceUser.id,
            fulfillmentType: 'PICKUP',
            status: 'IN_TRANSIT',
            agreedPriceCents: 450000,
            escrowHeldCents: 450000,
            platformFeeCents: 45000,
            scheduledAt: new Date(Date.now() + 3600000),
        },
    });
    await prisma.bookingRoute.create({
        data: {
            bookingId: booking1.id,
            currentLat: 13.0650,
            currentLng: 80.2450,
            heading: 42.0,
            speed: 28.5,
            etaMinutes: 18,
            waypoints: JSON.stringify([
                [13.0102, 80.2156],
                [13.0450, 80.2350],
                [13.0650, 80.2450],
                [13.0827, 80.2707],
            ]),
        },
    });
    // 8. Completed Booking & Form 1 Green Certificate
    const completedListing = createdListings[3]; // Telecom PCBs
    const completedBooking = await prisma.booking.create({
        data: {
            listingId: completedListing.id,
            collectorId: collectorUser1.collector.id,
            sourceId: sourceUser.id,
            fulfillmentType: 'PICKUP',
            status: 'COMPLETED',
            agreedPriceCents: 1540000,
            escrowHeldCents: 0,
            platformFeeCents: 154000,
            completedAt: new Date(Date.now() - 48 * 3600000),
        },
    });
    await certificate_service_js_1.CertificateService.generateCertificate({
        bookingId: completedBooking.id,
        sourceId: sourceUser.id,
        collectorId: collectorUser1.collector.id,
        requestUserId: sourceUser.id,
        isAdmin: true,
        co2SavedKg: 42.8,
        treesEquivalent: 2.1,
        weightDivertedKg: 12.0,
        materialsBreakdown: {
            'Gold (Au)': 0.062,
            'Copper (Cu)': 3.168,
            'Tantalum (Ta)': 0.045,
            'Recycled Polymer': 8.725,
        },
    });
    // 9. Collector Inventory
    for (let i = 0; i < 6; i++) {
        const item = itemsList[i];
        await prisma.inventory.create({
            data: {
                collectorId: collectorUser1.collector.id,
                categoryId: item.cat.id,
                title: `Inventory: ${item.title.split('-')[0]}`,
                description: 'Quality graded batch ready for smelter / refiner consolidation lot.',
                floorPriceCents: Math.round(item.price * 100),
                currentBidCents: Math.round(item.price * 105),
                status: 'ACTIVE',
                weightKg: item.weight,
                images: JSON.stringify([item.img]),
            },
        });
    }
    // 10. Financial Ledger
    await prisma.transaction.create({
        data: {
            walletId: (await prisma.wallet.findUnique({ where: { userId: sourceUser.id } })).id,
            type: 'ESCROW_RELEASE',
            amountCents: 1540000,
            balanceAfterCents: 1665000,
            refId: completedBooking.id,
            refType: 'booking',
            description: 'Handover complete: Telecom Baseband Motherboards (12kg)',
        },
    });
    console.log(`✅ Seeded successfully with 20 rich listings, dual AI models, bids, and certificates.`);
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
