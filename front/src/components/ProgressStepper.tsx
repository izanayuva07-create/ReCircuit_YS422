import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressStepperProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, orientation = 'vertical', className = '' }) => {
  if (orientation === 'horizontal') {
    return (
      <div className={`flex items-center overflow-x-auto gap-0 ${className}`}>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center min-w-0">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: step.status === 'upcoming' ? 'var(--border)' : 'var(--primary)',
                  color: step.status === 'upcoming' ? 'var(--text-secondary)' : '#fff',
                }}
              >
                {step.status === 'completed' ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs mt-1 text-center whitespace-nowrap px-1" style={{ color: step.status === 'current' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-4 min-w-4" style={{ backgroundColor: step.status === 'completed' ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: step.status === 'upcoming' ? 'var(--border)' : 'var(--primary)',
                color: step.status === 'upcoming' ? 'var(--text-secondary)' : '#fff',
              }}
            >
              {step.status === 'completed' ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: step.status === 'completed' ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </div>
          <div className={`pb-6 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
            <p
              className={`text-sm font-semibold ${step.status === 'current' ? 'text-primary-color' : ''}`}
              style={{ color: step.status === 'current' ? 'var(--primary)' : step.status === 'completed' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;
