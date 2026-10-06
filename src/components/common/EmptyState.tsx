import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-2xs space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
};
