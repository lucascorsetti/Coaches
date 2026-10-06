import React from 'react';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  sublabel?: string;
  showPercentText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  sublabel,
  showPercentText = true,
  size = 'md'
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentText || sublabel) && (
        <div className="flex items-center justify-between text-xs">
          <div>
            {label && <span className="font-medium text-slate-700">{label}</span>}
            {sublabel && <span className="text-slate-400 ml-1.5 text-[11px] font-mono">{sublabel}</span>}
          </div>
          {showPercentText && (
            <span className="font-mono font-semibold text-slate-800 text-xs">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            clamped === 100
              ? 'bg-emerald-600'
              : clamped > 0
              ? 'bg-blue-600'
              : 'bg-slate-300'
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
