import React from 'react';

export type BadgeVariant = 'default' | 'blue' | 'indigo' | 'amber' | 'emerald' | 'rose';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'xs',
  className = '',
  icon
}) => {
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 font-mono uppercase font-bold',
    sm: 'text-xs px-2.5 py-1 font-semibold'
  }[size];

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    amber: 'bg-amber-100 text-amber-900 border-amber-300',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200'
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded border tracking-tight ${sizeClasses} ${variantClasses} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
