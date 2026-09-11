const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 3;
const MAX_RESENDS = 3;
const OTP_SECRET = process.env.OTP_SECRET || crypto.randomBytes(32);
const E164 = /^\+[1-9]\d{7,14}$/;

app.use(express.json({ limit: '16kb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Replace these maps with Redis or a database before deploying multiple instances.
const sessions = new Map();
const auditLog = [];

function audit(pickupJobId, event, success, details = '') {
  auditLog.push({ pickupJobId, event, success, details, occurredAt: new Date().toISOString() });
  if (auditLog.length > 10000) auditLog.shift();
}

function error(res, status, code, message) {
  return res.status(status).json({ success: false, error: code, message });
}

function digest(otp) {
  return crypto.createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

function makeOtp() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
}

function sendSms(mobileNumber, otp) {
  // Replace with Twilio, MSG91, Firebase, or another SMS provider.
  console.log(`[SMS GATEWAY] OTP sent to ${mobileNumber.slice(0, -4)}****: ${otp}`);
}

function publicSession(session) {
  return {
    pickupJobId: session.pickupJobId,
    mobileLastFour: session.mobileNumber.slice(-4),
    eKartHandlerId: session.eKartHandlerId,
    collectorId: session.collectorId,
    status: session.status,
    expiresAt: new Date(session.expiresAt).toISOString(),
    attempts: session.attempts,
    resendCount: session.resendCount
  };
}

function validateGenerateBody(body) {
  const { mobileNumber, eKartHandlerId, pickupJobId } = body;
  if (!mobileNumber || !eKartHandlerId || !pickupJobId) return 'mobileNumber, eKartHandlerId and pickupJobId are required';
  if (!E164.test(mobileNumber)) return 'mobileNumber must use E.164 format, for example +14155552671';
  return null;
}

app.post('/api/handover/generate-otp', (req, res) => {
  const invalid = validateGenerateBody(req.body);
  if (invalid) return error(res, 400, 'invalid_request', invalid);
  const { mobileNumber, eKartHandlerId, pickupJobId, collectorId = 'UNASSIGNED' } = req.body;
  const activeStatuses = ['CONNECTED_PENDING_VERIFICATION', 'VERIFIED', 'COLLECTED', 'PAYMENT_PENDING'];
  const existing = sessions.get(pickupJobId);
  if (existing && activeStatuses.includes(existing.status)) return error(res, 409, 'active_transaction', 'This pickup already has an active OTP session');
  for (const session of sessions.values()) {
    if (session.mobileNumber === mobileNumber && session.expiresAt > Date.now() && activeStatuses.includes(session.status)) {
      return error(res, 409, 'active_transaction', 'This user already has an active collection transaction');
    }
  }
  const otp = makeOtp();
  const timestamp = Date.now();
  const session = {
    pickupJobId, mobileNumber, eKartHandlerId, collectorId,
    otpDigest: digest(otp), generatedAt: timestamp, expiresAt: timestamp + OTP_TTL_MS,
    lastSentAt: timestamp, attempts: 0, resendCount: 0,
    status: 'CONNECTED_PENDING_VERIFICATION'
  };
  sessions.set(pickupJobId, session);
  audit(pickupJobId, 'generated', true);
  sendSms(mobileNumber, otp);
  return res.status(201).json({ success: true, message: `OTP sent to mobile ending in ${mobileNumber.slice(-4)}`, ...publicSession(session) });
});

app.post('/api/handover/verify-otp', (req, res) => {
  const { pickupJobId, enteredOtp } = req.body;
  const session = sessions.get(pickupJobId);
  if (!session) return error(res, 404, 'session_not_found', 'No active handover session found');
  if (session.status !== 'CONNECTED_PENDING_VERIFICATION') return error(res, 409, 'invalid_session', 'OTP is no longer valid');
  if (Date.now() >= session.expiresAt) {
    session.status = 'EXPIRED';
    audit(pickupJobId, 'verify', false, 'expired');
    return error(res, 410, 'otp_expired', 'OTP has expired; generate a new OTP');
  }
  if (session.attempts >= MAX_ATTEMPTS) {
    session.status = 'REVOKED';
    audit(pickupJobId, 'verify', false, 'maximum attempts exceeded');
    return error(res, 429, 'max_attempts_exceeded', 'Maximum OTP attempts exceeded');
  }
  const valid = typeof enteredOtp === 'string' && /^\d{6}$/.test(enteredOtp) &&
    crypto.timingSafeEqual(Buffer.from(session.otpDigest, 'hex'), Buffer.from(digest(enteredOtp), 'hex'));
  if (!valid) {
    session.attempts += 1;
    if (session.attempts >= MAX_ATTEMPTS) session.status = 'REVOKED';
    audit(pickupJobId, 'verify', false, `invalid attempt ${session.attempts}`);
    return error(res, session.status === 'REVOKED' ? 429 : 401, session.status === 'REVOKED' ? 'max_attempts_exceeded' : 'invalid_otp', session.status === 'REVOKED' ? 'Maximum OTP attempts exceeded' : 'Invalid OTP');
  }
  session.status = 'VERIFIED';
  session.verifiedAt = Date.now();
  audit(pickupJobId, 'verified', true);
  return res.json({ success: true, message: 'OTP verified; handover authorized', ...publicSession(session) });
});

app.post('/api/handover/resend-otp', (req, res) => {
  const { pickupJobId } = req.body;
  const session = sessions.get(pickupJobId);
  if (!session) return error(res, 404, 'session_not_found', 'No active handover session found');
  if (session.status !== 'CONNECTED_PENDING_VERIFICATION') return error(res, 409, 'invalid_session', 'OTP is no longer resendable');
  if (Date.now() >= session.expiresAt) {
    session.status = 'EXPIRED';
    return error(res, 410, 'otp_expired', 'OTP has expired; generate a new OTP');
  }
  if (Date.now() - session.lastSentAt < RESEND_COOLDOWN_MS) return error(res, 429, 'resend_cooldown', 'Please wait before requesting another OTP');
  if (session.resendCount >= MAX_RESENDS) return error(res, 429, 'resend_limit_exceeded', 'Maximum OTP resends exceeded');
  const otp = makeOtp();
  session.otpDigest = digest(otp);
  session.generatedAt = Date.now();
  session.expiresAt = session.generatedAt + OTP_TTL_MS;
  session.lastSentAt = session.generatedAt;
  session.resendCount += 1;
  audit(pickupJobId, 'resent', true);
  sendSms(session.mobileNumber, otp);
  return res.json({ success: true, message: 'A new OTP was sent', ...publicSession(session) });
});

app.post('/api/handover/revoke-otp', (req, res) => {
  const session = sessions.get(req.body.pickupJobId);
  if (!session) return error(res, 404, 'session_not_found', 'No handover session found');
  session.status = 'REVOKED';
  session.otpDigest = null;
  audit(session.pickupJobId, 'revoked', true, req.body.reason || 'revoked by caller');
  return res.json({ success: true, ...publicSession(session) });
});

app.post('/api/handover/transition', (req, res) => {
  const { pickupJobId, status } = req.body;
  const session = sessions.get(pickupJobId);
  const allowed = { VERIFIED: 'COLLECTED', COLLECTED: 'PAYMENT_PENDING', PAYMENT_PENDING: 'COMPLETED' };
  if (!session) return error(res, 404, 'session_not_found', 'No handover session found');
  if (allowed[session.status] !== status) return error(res, 409, 'invalid_transition', `Cannot move ${session.status} to ${status}`);
  session.status = status;
  if (status === 'COMPLETED') session.otpDigest = null;
  audit(pickupJobId, status.toLowerCase(), true);
  return res.json({ success: true, ...publicSession(session) });
});

app.get('/api/health', (req, res) => res.json({ success: true, service: 'ewaste-otp', status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  return error(res, 500, 'internal_error', 'Unexpected server error');
});

app.listen(PORT, () => console.log(`ReCircuit OTP backend running at http://localhost:${PORT}`));

module.exports = { app, sessions, auditLog };