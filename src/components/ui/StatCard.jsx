import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600', ring: 'ring-blue-100', bar: 'from-blue-500 to-indigo-500' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-100', bar: 'from-emerald-500 to-teal-500' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-100', bar: 'from-amber-500 to-orange-500' },
  purple: { bg: 'bg-violet-50', icon: 'bg-violet-500', text: 'text-violet-600', ring: 'ring-violet-100', bar: 'from-violet-500 to-purple-500' },
  red: { bg: 'bg-red-50', icon: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-100', bar: 'from-red-500 to-rose-500' },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, trendLabel, prefix = '', suffix = '', sub }) {
  const c = colorMap[color] || colorMap.blue;

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 10000000) return `${prefix}${(val / 10000000).toFixed(1)}Cr${suffix}`;
      if (val >= 100000) return `${prefix}${(val / 100000).toFixed(1)}L${suffix}`;
      if (val >= 1000) return `${prefix}${(val / 1000).toFixed(0)}K${suffix}`;
      return `${prefix}${val.toLocaleString('en-IN')}${suffix}`;
    }
    return `${prefix}${val}${suffix}`;
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">{title}</p>
          <p className="text-slate-900 text-xl sm:text-2xl font-bold tracking-tight mt-1">{formatValue(value)}</p>
          {sub && <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">{sub}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-[11px] sm:text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% {trendLabel}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center shrink-0`}>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${c.icon} flex items-center justify-center`}>
            <Icon size={18} className="text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
