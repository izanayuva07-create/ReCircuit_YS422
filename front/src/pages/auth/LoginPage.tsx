import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

const demoAccounts: { role: UserRole; email: string; label: string }[] = [
  { role: 'source', email: 'source@recircuit.in', label: 'Source' },
  { role: 'collector', email: 'collector@recircuit.in', label: 'Collector' },
  { role: 'recycler', email: 'recycler@recircuit.in', label: 'Recycler' },
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading, authMode, clearError } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    clearError();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setFormError('Enter your password.');
      return;
    }
    try {
      const signedInUser = await signIn({ email, password });
      const requestedPath = (location.state as { from?: string } | null)?.from;
      const safeDestination = requestedPath?.startsWith(`/${signedInUser.role}`) ? requestedPath : `/${signedInUser.role}`;
      navigate(safeDestination, { replace: true });
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    }
  };

  const chooseDemo = (account: typeof demoAccounts[number]) => {
    setEmail(account.email);
    setPassword('demo123');
    setFormError('');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ backgroundColor: 'var(--background)' }}>
      <aside className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between text-white" style={{ background: 'linear-gradient(145deg, #14532d, #16a34a)' }}>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"><ArrowLeft size={16} /> Back to Re-Circuit</Link>
        <div className="max-w-md">
          <ShieldCheck size={46} className="mb-6" />
          <h1 className="text-4xl font-bold leading-tight">Every verified hand-off closes the loop.</h1>
          <p className="mt-4 text-white/75 leading-relaxed">Manage listings, pickups, inventory, and recycling records from one traceable platform.</p>
        </div>
        <p className="text-xs text-white/60">Re-Circuit · zero waste</p>
      </aside>

      <main className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-1 text-xs mb-6" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={14} /> Home</Link>
          <BrandLogo size="md" showTagline />
          <h2 className="text-2xl font-bold mt-7" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to continue your recycling journey.</p>

          {authMode === 'demo' && (
            <div className="mt-6 rounded-xl border p-3" style={{ backgroundColor: 'var(--primary-subtle)', borderColor: '#bbf7d0' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Local demo accounts · password: demo123</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {demoAccounts.map((account) => (
                  <button type="button" key={account.role} onClick={() => chooseDemo(account)} className="rounded-lg border bg-white px-2 py-2 text-xs font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{account.label}</button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card p-5 sm:p-6 mt-5 flex flex-col gap-4" noValidate>
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} leftIcon={<Mail size={16} />} autoComplete="email" id="login-email" />
            <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} leftIcon={<Lock size={16} />} autoComplete="current-password" id="login-password" />
            <button type="button" className="self-end text-xs font-medium" style={{ color: 'var(--primary)' }} onClick={() => setForgotOpen(true)}>Forgot password?</button>
            {formError && <p role="alert" className="text-xs px-3 py-2.5 rounded-lg" style={{ backgroundColor: '#fef2f2', color: 'var(--danger)' }}>{formError}</p>}
            <Button type="submit" fullWidth isLoading={isLoading} id="login-submit">Sign in</Button>
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>Don’t have an account? <Link to="/select-role" className="font-semibold" style={{ color: 'var(--primary)' }}>Create one</Link></p>
          </form>
        </div>
      </main>

      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset your password">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {authMode === 'api'
            ? 'Password recovery is managed by your organization. Contact support at hello@recircuit.in from your registered email address.'
            : 'Local demo accounts use the password demo123. Accounts created in this browser keep the password chosen during sign-up.'}
        </p>
        <Button fullWidth className="mt-5" onClick={() => setForgotOpen(false)}>Got it</Button>
      </Modal>
    </div>
  );
};

export default LoginPage;
