import React from 'react';
import { Sparkles, Sprout, BookOpen, Star } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'light', showSubtitle = true }) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl sm:text-3xl font-black tracking-tight'
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Visual Logo Emblem: Sprout + Star + Book harmony */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 shadow-md shadow-emerald-900/20 text-amber-300 border border-emerald-400/30 overflow-hidden`}>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400/30 rounded-full blur-xs" />
        <Sprout className="w-3/5 h-3/5 text-emerald-100 transform -rotate-6" />
        <div className="absolute bottom-1 right-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${titleSizes[size]} ${isDark ? 'text-white' : 'text-emerald-950'} font-extrabold font-sans leading-none flex items-center tracking-tight`}>
            SEKAR <span className="text-amber-500 ml-1">TALENTA</span>
          </span>
        </div>
        {showSubtitle && (
          <span className={`${subtitleSizes[size]} ${isDark ? 'text-emerald-200/80' : 'text-emerald-800/80'} font-medium leading-tight mt-0.5`}>
            UPT SDN Karanganyar Kota Pasuruan
          </span>
        )}
      </div>
    </div>
  );
};
