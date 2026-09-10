import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, Phone, User } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../context/AuthContext';

interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: React.FC = () => {
  const [form, setForm] = useState<SignupForm>({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const { pendingRole, signUp, isLoading, isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) return <Navigate to={`/${user.role}`} replace />;
  if (!pendingRole) return <Navigate to="/select-role" replace state={{ message: 'Choose a role before signing up.' }} />;

  const setField = (field: keyof SignupForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFormError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const digits = form.phone.replace(/\D/g, '');
    if (form.name.trim().length < 2) return setFormError('Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setFormError('Enter a valid email address.');
    if (digits.length < 10 || digits.length > 15) return setFormError('Enter a valid phone number.');
    if (form.password.length < 8) return setFormError('Use at least 8 characters for your password.');
    if (form.password !== form.confirmPassword) return setFormError('Passwords do not match.');
    try {
      const created = await signUp({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: pendingRole });
      navigate(`/${created.role}`, { replace: true });
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Unable to create your account.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <Link to="/select-role" className="inline-flex items-center gap-1 text-xs mb-6" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={14} /> Change role</Link>
        <div className="flex items-end justify-between gap-3">
          <BrandLogo size="md" showTagline />
          <span className="capitalize text-xs font-semibold rounded-full px-3 py-1.5" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-subtle)' }}>{pendingRole} account</span>
        </div>
        <h1 className="text-2xl font-bold mt-7" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Join the verified Re-Circuit network.</p>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-6 mt-5 flex flex-col gap-4" noValidate>
          <Input label="Full name" type="text" placeholder="Your name" value={form.name} onChange={setField('name')} leftIcon={<User size={16} />} autoComplete="name" id="signup-name" />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={setField('email')} leftIcon={<Mail size={16} />} autoComplete="email" id="signup-email" />
          <Input label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={setField('phone')} leftIcon={<Phone size={16} />} autoComplete="tel" id="signup-phone" />
          <Input label="Password" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={setField('password')} leftIcon={<Lock size={16} />} autoComplete="new-password" id="signup-password" hint="Use at least 8 characters." />
          <Input label="Confirm password" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={setField('confirmPassword')} leftIcon={<Lock size={16} />} autoComplete="new-password" id="signup-confirm" />
          {formError && <p role="alert" className="text-xs px-3 py-2.5 rounded-lg" style={{ backgroundColor: '#fef2f2', color: 'var(--danger)' }}>{formError}</p>}
          <Button type="submit" fullWidth isLoading={isLoading}>Create {pendingRole} account</Button>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>Already registered? <Link to="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
