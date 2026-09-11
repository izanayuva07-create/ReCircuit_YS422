import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Truck, Factory, ArrowRight } from 'lucide-react';
import type { UserRole } from '../../types';
import BrandLogo from '../../components/BrandLogo';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const roles: { role: UserRole; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    role: 'source',
    label: 'Seller / Source',
    description: 'I have e-waste to sell, inspect with AI, and recycle with Form 1 certificates.',
    icon: <UploadCloud size={28} />,
    color: '#16a34a',
  },
  {
    role: 'collector',
    label: 'Collector Logistics',
    description: 'I bid on e-waste lots, dispatch GPS-tracked vehicles, and aggregate inventory.',
    icon: <Truck size={28} />,
    color: '#0f766e',
  },
  {
    role: 'recycler',
    label: 'Disposer / Recycler',
    description: 'I operate an authorized refining, smelting, and hydrometallurgical recovery facility.',
    icon: <Factory size={28} />,
    color: '#d97706',
  },
];

const SelectRolePage: React.FC = () => {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { setRole, isAuthenticated } = useAuth();

  const handleContinue = () => {
    if (!selected) return;
    setRole(selected);
    // If not authenticated yet, go to signup
    if (!isAuthenticated) {
      navigate('/signup');
    } else {
      navigate(`/${selected}`);
    }
  };

  return (
    <div className="page-enter min-h-screen flex flex-col items-center justify-center p-4 sm:p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <BrandLogo size="md" showTagline className="justify-center items-center mb-4" />
          <span className="eyebrow mx-auto mt-7">One ecosystem · three equal roles</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl" style={{ color: 'var(--text-primary)' }}>Choose your place in the circuit.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Each workspace is designed around the decisions, hand-offs and impact that matter to you.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map(({ role, label, description, icon, color }) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              id={`role-${role}`}
              type="button"
              aria-pressed={selected === role}
              className="card relative min-h-56 w-full text-left p-6 rounded-2xl border-2 transition-all flex flex-col items-start gap-5"
              style={{
                borderColor: selected === role ? color : 'var(--border)',
                backgroundColor: selected === role ? 'var(--primary-subtle)' : 'var(--surface)',
                boxShadow: selected === role ? '0 0 0 3px rgba(11, 107, 69, 0.12)' : 'var(--shadow-sm)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: role === 'source' ? 'var(--primary-subtle)' : `${color}18`, color }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xl tracking-[-0.025em]" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-sm mt-2 leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p>
              </div>
              {selected === role && (
                <div className="absolute right-5 top-5 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
                  <ArrowRight size={12} color="white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <Button
          fullWidth
          size="lg"
          className="mx-auto mt-8 max-w-md"
          disabled={!selected}
          onClick={handleContinue}
          id="role-continue"
        >
          Continue as {selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : '...'}
        </Button>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
          You can change your role later from settings.
        </p>
      </div>
    </div>
  );
};

export default SelectRolePage;
