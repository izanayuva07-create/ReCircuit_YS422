export const BUSINESS_RULES = {
  // BR-001: Collector must have approved KYC before first payout
  REQUIRE_KYC_FOR_PAYOUT: true,

  // BR-002: Bid expires in 24h (configurable 1-72h)
  DEFAULT_BID_EXPIRY_HOURS: 24,

  // BR-003: Platform commission = 10% (held in escrow)
  PLATFORM_COMMISSION_RATE: 0.10,

  // BR-004: Escrow hold until BOTH parties confirm completion
  ESCROW_RELEASE_STATUS: 'COMPLETED',

  // BR-005: Rating only after COMPLETED; bidirectional
  RATING_ALLOWED_STATUS: 'COMPLETED',

  // BR-006: Collector service radius <= 100km
  MAX_COLLECTOR_RADIUS_KM: 100,

  // BR-007: Source can have max 5 active listings
  MAX_SOURCE_ACTIVE_LISTINGS: 5,

  // BR-008: Collector min bid >= material floor price
  ENFORCE_FLOOR_PRICE: true,

  // BR-009: Dispute window: 48h post-completion
  DISPUTE_WINDOW_HOURS: 48,

  // BR-010: Gamification badges auto-awarded daily
  AUTO_AWARD_BADGES: true,
};

export const AI_CONFIG = {
  MODEL_VERSION: 'efficientnet-b0-e-waste-v3.2',
  CONFIDENCE_THRESHOLD: 0.60,
  LATENCY_SIMULATION_MS: 320,
};
