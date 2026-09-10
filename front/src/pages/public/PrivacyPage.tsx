import React from 'react';

const sections = [
  ['Information we collect', 'Re-Circuit stores the profile, contact, pickup, listing, and transaction details needed to coordinate e-waste collection and traceability. Uploaded item photos are associated with the listing you create.'],
  ['How information is used', 'Information is used to match sources with collectors, coordinate verified pickups, maintain the recycling chain of custody, show impact records, and improve platform safety.'],
  ['Sharing and visibility', 'A collector sees only the pickup information required for an accepted job. Recyclers receive digital-lot records needed to verify and process material. We do not sell personal information.'],
  ['Your choices', 'You can update your profile in your role dashboard. You may cancel eligible listings before pickup and can request account or data deletion by contacting hello@recircuit.in.'],
  ['Security', 'This frontend uses browser storage in local demo mode. A production deployment must configure the Re-Circuit API so credentials and operational records are handled by the secured backend.'],
];

const PrivacyPage: React.FC = () => (
  <div className="max-container py-12 md:py-16">
    <div className="max-w-3xl mx-auto">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Legal</span>
      <h1 className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>Privacy policy</h1>
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

export default PrivacyPage;
