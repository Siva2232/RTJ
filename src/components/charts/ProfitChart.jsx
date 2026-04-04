import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { selectAllCars, calcTotalCost, calcProfit } from '../../store/slices/carSlice';

const formatINR = (v) => {
  const isNegative = v < 0;
  const absV = Math.abs(v);
  let formatted = '';
  if (absV >= 100000) formatted = `${(absV / 100000).toFixed(0)}L`;
  else if (absV >= 1000) formatted = `${(absV / 1000).toFixed(0)}K`;
  else formatted = `${absV}`;
  return `${isNegative ? '-' : ''}₹${formatted}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ProfitChart() {
  const cars = useSelector(selectAllCars);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-slate-900 font-semibold text-base">Monthly Performance</h3>
        <p className="text-slate-500 text-sm">Investment vs Revenue vs Profit</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gInvestment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
          <Area type="monotone" dataKey="investment" stroke="#94a3b8" strokeWidth={2} fill="url(#gInvestment)" name="Investment" />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#gRevenue)" name="Revenue" />
          <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#gProfit)" name="Profit" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
