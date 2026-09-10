import { CertificateService } from '../src/modules/certificates/certificate.service.js';
import { prisma } from '../src/lib/prisma.js';

async function runCertificateTests() {
  console.log('🧪 Starting ReCircuit Green Recycling Certificate Test Suite...');
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
    // 1. Setup Test Completed Booking
    const sourceUser = await prisma.user.findFirst({ where: { role: 'source' } });
    const collector = await prisma.collector.findFirst();
    const category = await prisma.category.findFirst({ where: { slug: 'computers-laptops' } });

    assert(!!sourceUser && !!collector && !!category, 'Found base seed entities for certificate test');

    const testListing = await prisma.listing.create({
      data: {
        sourceId: sourceUser!.id,
        categoryId: category!.id,
        title: 'Dell Latitude Enterprise Notebook (Certified Batch)',
        images: JSON.stringify(['https://images.unsplash.com/sample-laptop.jpg']),
        status: 'COMPLETED',
        estimatedWeight: 2.4,
        address: 'Cyber Hub, Gurugram, Haryana',
      },
    });

    const testBooking = await prisma.booking.create({
      data: {
        listingId: testListing.id,
        collectorId: collector!.id,
        sourceId: sourceUser!.id,
        status: 'COMPLETED',
        agreedPriceCents: 380000,
        escrowHeldCents: 380000,
        platformFeeCents: 38000,
        completedAt: new Date(),
      },
    });

    // Test 1: Generate Certificate from Real Database Information
    console.log('\n📜 Test 1: Certificate Generation from Real Database Data...');
    const cert = await CertificateService.generateCertificate({
      bookingId: testBooking.id,
      requestUserId: sourceUser!.id,
    });

    assert(!!cert.certificateId, `Certificate generated with ID: ${cert.certificateId}`);
    assert(cert.certificateId.startsWith('RC-EWR-2026-'), 'Certificate ID matches format RC-EWR-2026-XXXXXX');
    assert(cert.userNameSnapshot === sourceUser!.name, `Snapshot name matches user DB name: "${cert.userNameSnapshot}"`);
    assert(cert.weightKg === 2.4, 'Physical weight accurately captured from listing record');
    assert(cert.certificateStatus === 'VERIFIED', 'Initial certificate status is VERIFIED');
    assert(!!cert.qrCodeDataUrl && cert.qrCodeDataUrl.startsWith('data:image/png;base64,'), 'Real scannable QR code generated');
    assert(!!cert.materialsRecoveredKg && cert.materialsRecoveredKg > 0, 'Recovered materials calculated via service');
    assert(!!cert.co2ReductionKg && cert.co2ReductionKg > 0, 'Estimated CO2 reduction computed');

    // Test 2: Duplicate Certificate Prevention
    console.log('\n🔒 Test 2: Duplicate Certificate Prevention...');
    const certDuplicate = await CertificateService.generateCertificate({
      bookingId: testBooking.id,
      requestUserId: sourceUser!.id,
    });
    assert(certDuplicate.id === cert.id, 'Duplicate generation idempotently returns existing certificate');

    const certCountForBooking = await prisma.certificate.count({ where: { transactionId: testBooking.id } });
    assert(certCountForBooking === 1, 'Strictly 1 certificate exists for the transaction (unique constraint preserved)');

    // Test 3: Public Verification (Sanitized, Zero PII Exposure)
    console.log('\n🔍 Test 3: Public Verification Endpoint...');
    const verification = await CertificateService.verifyCertificate(cert.certificateId);
    assert(verification.isValid === true, 'Public verification confirms certificate is valid');
    assert(verification.status === 'CERTIFICATE VERIFIED', 'Status shows "CERTIFICATE VERIFIED"');
    assert(verification.recipientName === sourceUser!.name, 'Displays recipient full name');
    assert((verification as any).phone === undefined, 'No sensitive phone number exposed');
    assert((verification as any).email === undefined, 'No private email exposed');

    // Test 4: Invalid Certificate Lookup
    console.log('\n❌ Test 4: Invalid Certificate Handling...');
    const invalidCheck = await CertificateService.verifyCertificate('RC-EWR-NON-EXISTENT-9999');
    assert(invalidCheck.isValid === false, 'Invalid certificate rejected');
    assert(invalidCheck.status === 'CERTIFICATE NOT FOUND', 'Status shows "CERTIFICATE NOT FOUND"');

    // Test 5: Revocation Flow
    console.log('\n⚖️ Test 5: Revocation Flow...');
    const revoked = await CertificateService.revokeCertificate(cert.certificateId, 'Material batch re-audit discrepancy');
    assert(revoked.certificateStatus === 'REVOKED', 'Status updated to REVOKED');
    assert(!!revoked.revokedAt, 'Revocation timestamp recorded');

    const verificationAfterRevocation = await CertificateService.verifyCertificate(cert.certificateId);
    assert(verificationAfterRevocation.isValid === false, 'Revoked certificate flagged as invalid');
    assert(verificationAfterRevocation.status === 'CERTIFICATE REVOKED', 'Status returns "CERTIFICATE REVOKED"');
    assert(verificationAfterRevocation.revocationReason === 'Material batch re-audit discrepancy', 'Revocation reason provided');

    console.log(`\n========================================`);
    console.log(`📊 Certificate Tests: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Certificate test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCertificateTests();
