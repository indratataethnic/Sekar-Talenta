import React from 'react';
import { Heart, School, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Footer: React.FC = () => {
  const { schoolProfile } = useData();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/60 py-6 px-4 sm:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span className="font-semibold text-slate-700">{schoolProfile.name}</span>
          <span className="text-slate-400">•</span>
          <span>{schoolProfile.city}</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-[11px]">
          <span>{schoolProfile.tagline}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>SEKAR TALENTA — Sistem Eksplorasi Karakter, Bakat, Minat, dan Talenta Murid © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};
