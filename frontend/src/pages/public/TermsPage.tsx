import React from 'react';

const sections = [
  ['Using Re-Circuit', 'Provide accurate item, condition, quantity, and pickup information. Do not list prohibited, stolen, radioactive, biohazardous, or otherwise unlawful material.'],
  ['Bids and pickups', 'A bid becomes a booking only after the source accepts it. Sources and collectors should use the in-platform status and OTP flow so the hand-off is recorded accurately.'],
  ['Safe handling', 'All participants must follow applicable safety guidance. Collectors and recyclers are responsible for maintaining licenses and following local e-waste handling requirements.'],
  ['Payments and values', 'Price estimates are indicative. The accepted bid is the agreed transaction value unless both parties record a lawful adjustment during verification.'],
  ['Platform availability', 'Features may evolve as the service grows. Re-Circuit may suspend activity that threatens safety, security, traceability, or other participants.'],
];

const TermsPage: React.FC = () => (
  <div className="max-container py-12 md:py-16">
    <div className="max-w-3xl mx-auto">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Legal</span>
      <h1 className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>Terms of use</h1>
      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Last updated: 10 September 2026</p>
      <div className="mt-8 flex flex-col gap-6">
        {sections.map(([title, body]) => (
          <section key={title} className="card p-5 md:p-6">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>{body}</p>
          </section>
        ))}
      </div>
    </div>
  </div>
);

export default TermsPage;
