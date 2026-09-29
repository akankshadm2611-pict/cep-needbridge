import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const HelpingHandsLogo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-amber-500 p-0.5 shadow-sm shadow-teal-500/20 ${iconSizes[size]}`}>
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center p-1.5 transition-colors">
          {/* Helping hands intertwined SVG motif */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-teal-600">
            {/* Bridge arch */}
            <path d="M3 18C7 11 17 11 21 18" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M6 18V15M12 18V13M18 18V15" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" />
            {/* Helping Hands holding heart / star */}
            <path d="M8 8.5C8 8.5 9.5 7 12 7C14.5 7 16 8.5 16 8.5" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="5" r="1.5" fill="#f59e0b" />
          </svg>
        </div>
      </div>

      {showText && (
        <span className={`font-display font-bold tracking-tight text-slate-900 dark:text-white transition-colors ${textSizes[size]}`}>
          Need<span className="text-teal-600 dark:text-teal-400">Bridge</span>
        </span>
      )}
    </div>
  );
};

export const HelpingHandsGraphicBackdrop: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* Light soft ambient blobs */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-teal-200/35 dark:bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-200/25 dark:bg-blue-500/10 rounded-full blur-3xl" />

      {/* Subtle hand & bridge wireframe watermark SVGs */}
      <svg className="absolute top-12 right-8 w-72 h-72 text-teal-500/[0.04] dark:text-teal-400/[0.03]" viewBox="0 0 200 200" fill="currentColor">
        <path d="M40 160 C 60 90, 140 90, 160 160 Z" />
        <circle cx="100" cy="70" r="25" />
      </svg>

      <svg className="absolute bottom-24 left-6 w-80 h-80 text-amber-500/[0.035] dark:text-amber-400/[0.03]" viewBox="0 0 200 200" fill="currentColor">
        <path d="M20 150 Q 100 40 180 150" stroke="currentColor" strokeWidth="8" fill="none" />
      </svg>
    </div>
  );
};
