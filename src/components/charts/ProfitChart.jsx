import { useMemo, useId } from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { selectAllCars, calcTotalCost, calcProfit } from '../../store/slices/carSlice';

const formatINR = (v) => {
  const isNegative = v < 0;
  const absV = Math.abs(v);
  let formatted = '';
  if (absV >= 100000) formatted = `${(absV / 100000).toFixed(1)}L`;
  else if (absV >= 1000) formatted = `${(absV / 1000).toFixed(0)}K`;
  else formatted = `${absV}`;
  return `${isNegative ? '-' : ''}₹${formatted}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-slate-500 capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-slate-800">{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ProfitChart({ embedded = false, title = 'Monthly Performance', subtitle = 'Investment vs revenue vs profit' }) {
  const cars = useSelector(selectAllCars);
  const uid = useId().replace(/:/g, '');

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });

      const monthCars = cars.filter((c) => {
        const ref = c.purchaseDate ? new Date(c.purchaseDate) : null;
        return ref && ref.getFullYear() === d.getFullYear() && ref.getMonth() === d.getMonth();
      });
      const soldThisMonth = cars.filter((c) => {
        const ref = c.soldDate ? new Date(c.soldDate) : null;
        return ref && ref.getFullYear() === d.getFullYear() && ref.getMonth() === d.getMonth();
      });

      months.push({
        month: label,
        investment: monthCars.reduce((s, c) => s + calcTotalCost(c), 0),
        revenue: soldThisMonth.reduce((s, c) => s + (c.sellingPrice || 0), 0),
        profit: soldThisMonth.reduce((s, c) => s + calcProfit(c), 0),
      });
    }
    return months;
  }, [cars]);

  const totals = useMemo(() => {
    const last = monthlyData[monthlyData.length - 1] || { revenue: 0, profit: 0, investment: 0 };
    const ytdProfit = monthlyData.reduce((s, m) => s + m.profit, 0);
    return { last, ytdProfit };
  }, [monthlyData]);

  const content = (
    <>
      {!embedded && (
        <div className="mb-4 sm:mb-5">
          <h3 className="text-slate-900 font-semibold text-sm sm:text-base">{title}</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{subtitle}</p>
        </div>
      )}

      {/* Quick summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        {[
          { label: 'This Month Rev', value: formatINR(totals.last.revenue), color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'This Month P&L', value: formatINR(totals.last.profit), color: totals.last.profit >= 0 ? 'text-emerald-600' : 'text-red-500', bg: totals.last.profit >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
          { label: '12M Profit', value: formatINR(totals.ytdProfit), color: totals.ytdProfit >= 0 ? 'text-violet-600' : 'text-red-500', bg: 'bg-violet-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 ${bg} border border-white`}>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">{label}</p>
            <p className={`text-xs sm:text-sm font-bold mt-0.5 truncate ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="w-full h-[220px] sm:h-[260px] lg:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={`${uid}-investment`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`${uid}-revenue`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`${uid}-profit`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatINR}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            <Area type="monotone" dataKey="investment" stroke="#94a3b8" strokeWidth={2} fill={`url(#${uid}-investment)`} name="Investment" />
            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill={`url(#${uid}-revenue)`} name="Revenue" />
            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill={`url(#${uid}-profit)`} name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {totals.ytdProfit !== 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          {totals.ytdProfit >= 0 ? (
            <TrendingUp size={14} className="text-emerald-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span>Trailing 12-month net {totals.ytdProfit >= 0 ? 'profit' : 'loss'}: <strong className={totals.ytdProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>{formatINR(totals.ytdProfit)}</strong></span>
        </div>
      )}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
      {content}
    </div>
  );
}
