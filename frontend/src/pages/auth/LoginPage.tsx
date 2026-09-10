import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Mail,
  ShieldCheck,
  UploadCloud,
  Truck,
  Factory,
} from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface SegmentInfo {
  role: UserRole;
  label: string;
  tag: string;
  badge: string;
  email: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  benefits: string[];
}

const SEGMENTS: SegmentInfo[] = [
  {
    role: 'source',
    label: 'Seller',
    tag: 'Source / Generator',
    badge: 'Sell & Recycle',
    email: 'source@example.com',
    description: 'Individuals & enterprises selling or disposing of e-waste assets with verified digital manifests.',
    icon: UploadCloud,
    color: '#16a34a',
    benefits: ['AI YOLOv8 & DINOv2 asset inspection', 'Competitive live collector auction', 'CPCB Form 1 Green Certificate'],
  },
  {
    role: 'collector',
    label: 'Collector',
    tag: 'Logistics Partner',
    badge: 'Pickup & Auction',
    email: 'collector@example.com',
    description: 'CPCB-authorized collection agents bidding on listings, dispatching smart trucks, and building refinery lots.',
    icon: Truck,
    color: '#0f766e',
    benefits: ['Live GPS route telemetry & ETA', 'Digital inventory lots & barcode scanner', 'Automated escrow payment guarantee'],
  },
  {
    role: 'recycler',
    label: 'Disposer',
    tag: 'Recycler & Smelter',
    badge: 'Refining Facility',
    email: 'recycler@example.com',
    description: 'R2v3 / CPCB authorized recycling and smelting facilities performing material extraction.',
    icon: Factory,
    color: '#d97706',
    benefits: ['Incoming consolidated digital lots', 'Hydrometallurgical purity verification', 'Cryptographic compliance certification'],
  },
];

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('source');
  const [email, setEmail] = useState('source@example.com');
  const [password, setPassword] = useState('password123');
  const [formError, setFormError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading, clearError } = useAuth();

  const currentSegment = SEGMENTS.find((s) => s.role === selectedRole) ?? SEGMENTS[0];

  const handleSelectSegment = (seg: SegmentInfo) => {
    setSelectedRole(seg.role);
    setEmail(seg.email);
    setPassword('password123');
    setFormError('');
    clearError();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    clearError();

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    try {
      const signedInUser = await signIn({
        email: email.trim(),
        password,
        role: selectedRole,
      });

      const requestedPath = (location.state as { from?: string } | null)?.from;
      const safeDestination =
        requestedPath?.startsWith(`/${signedInUser.role}`) ? requestedPath : `/${signedInUser.role}`;

      navigate(safeDestination, { replace: true });
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to sign in. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left Decorative Showcase Panel */}
      <aside
        className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between text-white"
        style={{
          background: 'linear-gradient(145deg, #064e3b, #0f766e, #065f46)',
        }}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <ArrowLeft size={16} /> Back to Re-Circuit
        </Link>

        <div className="max-w-lg">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck size={28} className="text-emerald-300" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-300 block">
                Closed-Loop Ecosystem
              </span>
              <span className="text-base font-bold text-white">Three Segments · One Circular Network</span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Traceable E-Waste Fulfillment for Every Stakeholder.
          </h1>
          <p className="mt-4 text-white/80 leading-relaxed text-sm">
            Whether you are selling scrap, collecting with certified scales, or operating downstream refining furnaces,
            Re-Circuit unifies compliance, bidding, and logistics.
          </p>

          {/* Role Segment Highlights */}
          <div className="mt-8 flex flex-col gap-3">
            {SEGMENTS.map((seg) => {
              const Icon = seg.icon;
              const isCurrent = seg.role === selectedRole;
              return (
                <div
                  key={seg.role}
                  onClick={() => handleSelectSegment(seg)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isCurrent
                      ? 'bg-white/15 border-white/40 shadow-lg translate-x-1'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${seg.color}30`, color: 'white' }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{seg.label} Portal</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {seg.badge}
                      </span>
                    </div>
                    <span className="text-xs text-white/70 block truncate mt-0.5">{seg.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/60 pt-6 border-t border-white/10">
          <span>CPCB E-Waste Rules 2022 Compliant</span>
          <span>Re-Circuit Platform v2.4</span>
        </div>
      </aside>

      {/* Main Login Interface */}
      <main className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="lg:hidden inline-flex items-center gap-1 text-xs mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} /> Home
          </Link>

          <BrandLogo size="md" showTagline />

          <div className="mt-6 mb-4">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Sign In to Your Workspace
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Choose your role segment below to access tailored tools and live manifests.
            </p>
          </div>

          {/* Three-Segment Role Switcher */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            {SEGMENTS.map((seg) => {
              const Icon = seg.icon;
              const isSelected = seg.role === selectedRole;
              return (
                <button
                  type="button"
                  key={seg.role}
                  onClick={() => handleSelectSegment(seg)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                  style={{
                    borderBottom: isSelected ? `2.5px solid ${seg.color}` : '2.5px solid transparent',
                  }}
                >
                  <Icon size={18} className="mb-1" style={{ color: isSelected ? seg.color : 'inherit' }} />
                  <span>{seg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Segment Banner */}
          <div
            className="mt-3 p-3 rounded-xl border text-xs flex flex-col gap-1 transition-all"
            style={{
              backgroundColor: `${currentSegment.color}0d`,
              borderColor: `${currentSegment.color}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5" style={{ color: currentSegment.color }}>
                <currentSegment.icon size={14} />
                {currentSegment.label} Segment · {currentSegment.tag}
              </span>
              <span className="font-mono text-[10px] text-slate-500">Auto-filled for testing</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {currentSegment.description}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="card p-5 sm:p-6 mt-4 flex flex-col gap-4" noValidate>
            <Input
              label="Registered Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
              id="login-email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              leftIcon={<Lock size={16} />}
              autoComplete="current-password"
              id="login-password"
              required
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">Password: password123</span>
              <button
                type="button"
                className="font-medium hover:underline"
                style={{ color: currentSegment.color }}
                onClick={() => setForgotOpen(true)}
              >
                Forgot password?
              </button>
            </div>

            {formError && (
              <p
                role="alert"
                className="text-xs px-3 py-2.5 rounded-lg border border-red-200"
                style={{ backgroundColor: '#fef2f2', color: 'var(--danger)' }}
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              id="login-submit"
              style={{ backgroundColor: currentSegment.color }}
            >
              Sign In to {currentSegment.label} Portal
            </Button>

            <div className="text-center text-xs mt-1 text-slate-500">
              New to Re-Circuit?{' '}
              <Link to="/select-role" className="font-semibold underline" style={{ color: currentSegment.color }}>
                Register your organization
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset your password">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Password recovery for {currentSegment.label} credentials is authenticated via CPCB-registered contact email.
          For local demonstration, use the default password <code>password123</code> or <code>demo123</code>.
        </p>
        <Button fullWidth className="mt-5" onClick={() => setForgotOpen(false)}>
          Got it
        </Button>
      </Modal>
    </div>
  );
};

export default LoginPage;
