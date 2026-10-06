import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'blue' | 'indigo' | 'amber' | 'emerald';
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; onClick?: () => void }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'blue',
  actions,
  breadcrumbs
}) => {
  const badgeClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }[badgeVariant];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {b.onClick ? (
                  <button
                    onClick={b.onClick}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span className="text-slate-800 font-semibold">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badgeText && (
            <span className={`font-mono text-xs px-2 py-0.5 rounded border font-semibold ${badgeClasses}`}>
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-slate-600">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
