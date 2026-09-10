import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { Mail, Newspaper } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t mt-auto" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <BrandLogo size="md" showTagline />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Connecting e-waste sources, collectors, and certified recyclers for a cleaner tomorrow.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Platform</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'For Sources', href: '/select-role' },
                { label: 'For Collectors', href: '/select-role' },
                { label: 'For Recyclers', href: '/select-role' },
              ].map((l) => (
                <Link key={l.label} to={l.href} className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Resources</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Awareness', href: '/awareness' },
                { label: 'Safety Guide', href: '/safety' },
                { label: 'E-Waste News', href: '/news' },
                { label: 'About', href: '/#about' },
              ].map((l) => (
                <Link key={l.href} to={l.href} className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Contact</p>
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@recircuit.in" className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Mail size={14} /> hello@recircuit.in
              </a>
              <Link to="/news" className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><Newspaper size={14} /> Demo newsroom</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Re-Circuit. Built for a sustainable future.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs hover:underline" style={{ color: 'var(--text-secondary)' }}>Privacy</Link>
            <Link to="/terms" className="text-xs hover:underline" style={{ color: 'var(--text-secondary)' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
