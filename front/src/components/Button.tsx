import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--primary)', color: '#fff', border: 'none' },
  secondary: { backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary)' },
  outline: { backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  ghost: { backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none' },
  danger: { backgroundColor: 'var(--danger)', color: '#fff', border: 'none' },
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all touch-target
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'primary' && !isDisabled ? 'premium-button' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90 active:scale-[0.985]'}
        ${className}`}
      style={variantStyles[variant]}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
