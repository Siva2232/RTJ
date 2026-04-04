import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, trendLabel, prefix = '', suffix = '' }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-600', text: 'text-amber-600' },
    purple: { bg: 'bg-violet-50', icon: 'bg-violet-600', text: 'text-violet-600' },
    red: { bg: 'bg-red-50', icon: 'bg-red-600', text: 'text-red-600' },
  };
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
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-slate-900 text-2xl font-bold tracking-tight">{formatValue(value)}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{Math.abs(trend)}% {trendLabel}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={22} className={c.text} />
        </div>
      </div>
    </motion.div>
  );
}
