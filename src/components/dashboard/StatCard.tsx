import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../common/Card';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'teal' | 'orange';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  onClick,
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/30',
      textAccent: 'text-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
      textAccent: 'text-amber-700'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600 text-white shadow-blue-600/30',
      textAccent: 'text-blue-700'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-600 text-white shadow-purple-600/30',
      textAccent: 'text-purple-700'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-600 text-white shadow-rose-600/30',
      textAccent: 'text-rose-700'
    },
    teal: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-600 text-white shadow-teal-600/30',
      textAccent: 'text-teal-700'
    },
    orange: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      iconBg: 'bg-orange-600 text-white shadow-orange-600/30',
      textAccent: 'text-orange-700'
    }
  };

  const style = variantStyles[variant];

  return (
    <Card
      onClick={onClick}
      hoverable={!!onClick}
      className="flex items-center justify-between p-5 relative overflow-hidden"
    >
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        </div>
        {subtitle && <p className="text-[11px] font-medium text-slate-400">{subtitle}</p>}
      </div>

      <div className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
    </Card>
  );
};
