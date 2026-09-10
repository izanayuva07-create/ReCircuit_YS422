import { AIService } from '../src/modules/ai/ai.service.js';
import { MatchingService } from '../src/modules/matching/matching.service.js';
import { LedgerService } from '../src/modules/payments/ledger.service.js';
import { prisma } from '../src/lib/prisma.js';

async function runTests() {
  console.log('🧪 Starting ReCircuit Automated Backend Test Suite...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: AI Vision Classification
    console.log('\n🔍 Testing AI Classification Engine (§4)...');
    const aiResult = await AIService.classifyImage('https://images.unsplash.com/sample-laptop.jpg', 'ThinkPad Core i7');
    assert(aiResult.topPrediction.class_id === 'laptop', 'Classifies laptop correctly');
    assert(aiResult.isConfident === true, 'Confidence threshold met (>= 0.60)');
    assert(aiResult.modelVersion === 'efficientnet-b0-e-waste-v3.2', 'Model version matches spec v3.2');
    assert(aiResult.topPrediction.attributes.contains_lithium_battery === true, 'Extracts dynamic hazard attributes');

    // Test 2: AI Low Confidence Fallback
    const blurryResult = await AIService.classifyImage('https://example.com/unknown_blur.png');
    assert(blurryResult.isConfident === false, 'Detects low-confidence input for manual fallback');

    // Test 3: Geospatial Matching Engine (§7.2)
    console.log('\n📍 Testing Geospatial & Ranked Matching (§7)...');
    const matches = await MatchingService.findMatchingCollectors({
      lat: 28.6280, // Noida
      lng: 77.3649,
      radiusKm: 60,
    });
    assert(matches.collectors.length > 0, 'Finds active approved collectors within radius');
    assert(matches.collectors[0].compositeScore >= matches.collectors[matches.collectors.length - 1].compositeScore, 'Collectors correctly sorted by composite score');
    assert(matches.collectors[0].distanceKm <= 60, 'Enforces service radius filter (BR-006)');

    // Test 4: Financial Double-Entry Ledger (§5)
    console.log('\n💰 Testing Double-Entry Ledger & Escrow Settlement (§5)...');
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    const sourceUser = await prisma.user.findFirst({ where: { role: 'source' } });
    const collectorUser = await prisma.user.findFirst({ where: { role: 'collector' } });

    assert(!!adminUser && !!sourceUser && !!collectorUser, 'Found seed users for ledger test');

    const testBookingId = `test_bk_${Date.now()}`;
    const testAmountCents = 500000; // ₹5,000.00

    // Step 4a: Hold escrow
    await LedgerService.holdEscrow({
      sourceUserId: sourceUser!.id,
      bookingId: testBookingId,
      amountCents: testAmountCents,
      platformUserId: adminUser!.id,
    });

    // Step 4b: Release escrow (BR-003: 10% platform fee, 90% to collector)
    const releaseResult = await LedgerService.releaseEscrow({
      collectorUserId: collectorUser!.id,
      bookingId: testBookingId,
      totalAmountCents: testAmountCents,
      platformUserId: adminUser!.id,
    });

    assert(releaseResult.collectorPayoutCents === 450000, 'Collector receives exactly 90% (₹4,500)');
    assert(releaseResult.platformFeeCents === 50000, 'Platform retains exactly 10% commission (₹500)');

    // Test 5: Verify Ledger Integrity
    const integrity = await LedgerService.verifyWalletIntegrity((await LedgerService.getOrCreateWallet(collectorUser!.id)).id);
    assert(integrity.valid === true, 'Collector wallet balance integrity verified (balanceCents === sum(transactions))');

    console.log(`\n========================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
