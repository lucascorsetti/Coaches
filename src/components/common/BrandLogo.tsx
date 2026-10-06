import React from 'react';
import { BRANDING_CONFIG } from '../../config/branding';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true
}) => {
  const boxDimensions = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* High-contrast IHDP Icon Box */}
      <div className={`${boxDimensions} rounded-lg bg-blue-600 flex items-center justify-center font-black text-white tracking-wider shadow-2xs shrink-0 select-none`}>
        IHDP
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-tight">
          <span className="font-extrabold text-sm tracking-tight text-white">
            {BRANDING_CONFIG.organizationShort}
          </span>
          <span className="text-slate-400 text-xs font-semibold">/</span>
          <span className="font-bold text-xs text-blue-400 font-mono tracking-tight">
            {BRANDING_CONFIG.displayName}
          </span>
        </div>
        {showSubtitle && (
          <div className="text-[10px] text-slate-400 font-medium tracking-normal line-clamp-1">
            {BRANDING_CONFIG.organization}
          </div>
        )}
      </div>
    </div>
  );
};
