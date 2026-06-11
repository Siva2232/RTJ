import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllCars, calcTotalCost, calcProfit } from '../store/slices/carSlice';
import ProfitChart from '../components/charts/ProfitChart';
import ExpenseChart from '../components/charts/ExpenseChart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { Users, TrendingUp, ShoppingBag, Award, Download } from 'lucide-react';
import api from '../services/api';
import {
  DashboardPage, DashboardBanner, BannerStatGrid,
  DashboardSection, EmptyState,
} from '../components/dashboard/DashboardUI';

const PERIODS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function getPeriodStart(period) {
  const d = new Date();
  if (period === 'weekly') {
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function StaffCard({ name, role, rows, accent }) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${accent}`}>
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100/80">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{role}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className="bg-white/70 rounded-lg px-2.5 py-2">
            <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            <p className={`text-sm font-bold mt-0.5 truncate ${highlight || 'text-slate-800'}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const cars = useSelector(selectAllCars);
  const [period, setPeriod] = useState('monthly');
  const [downloading, setDownloading] = useState(false);

  const periodStart = getPeriodStart(period);
  const periodLabel = PERIODS.find((p) => p.key === period)?.label || 'Monthly';

  const filteredSoldCars = cars.filter(
    (c) => c.status === 'sold' && c.soldDate && new Date(c.soldDate) >= periodStart
  );

  const filteredAllCars = cars.filter((c) => {
    const d = c.purchaseDate || c.createdAt;
    return d && new Date(d) >= periodStart;
  });

  const soldCars = filteredSoldCars;

  const { salesTeam, purchaseTeam } = filteredAllCars.reduce((acc, car) => {
    if (car.status === 'sold' && car.soldBy && new Date(car.soldDate) >= periodStart) {
      const seller = car.soldBy.name || 'Unknown';
      if (!acc.salesTeam[seller]) {
        acc.salesTeam[seller] = { name: seller, sales: 0, revenue: 0, profit: 0, incentives: 0 };
      }
      const profit = calcProfit(car);
      acc.salesTeam[seller].sales += 1;
      acc.salesTeam[seller].revenue += car.sellingPrice || 0;
      acc.salesTeam[seller].profit += profit;
      if (profit > 0) acc.salesTeam[seller].incentives += profit * 0.02;
    }

    if (car.purchasedBy) {
      const buyer = car.purchasedBy.name || 'Unknown';
      if (!acc.purchaseTeam[buyer]) {
        acc.purchaseTeam[buyer] = { name: buyer, purchases: 0, investment: 0, stockActive: 0 };
      }
      acc.purchaseTeam[buyer].purchases += 1;
      acc.purchaseTeam[buyer].investment += car.purchasePrice || 0;
      if (car.status !== 'sold') acc.purchaseTeam[buyer].stockActive += 1;
    }
    return acc;
  }, { salesTeam: {}, purchaseTeam: {} });

  const salesData = Object.values(salesTeam).sort((a, b) => b.revenue - a.revenue);
  const purchaseData = Object.values(purchaseTeam).sort((a, b) => b.purchases - a.purchases);

  const carProfitData = soldCars.map((c) => ({
    name: `${c.brand} ${c.model}`.slice(0, 12),
    profit: calcProfit(c),
  }));

  const totalInvestment = filteredAllCars.reduce((s, c) => s + calcTotalCost(c), 0);
  const totalRevenue = soldCars.reduce((s, c) => s + c.sellingPrice, 0);
  const totalProfitFix = soldCars.reduce((s, c) => s + calcProfit(c), 0);
  const avgProfitPerCar = soldCars.length ? Math.round(totalProfitFix / soldCars.length) : 0;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/cars/export/report?period=${period}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${period.charAt(0).toUpperCase() + period.slice(1)}-Report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardPage>
      <DashboardBanner
        eyebrow="Analytics"
        title="Business Reports"
        description={`${periodLabel} performance · ${salesData.length + purchaseData.length} active staff`}
        gradient="from-blue-600 via-indigo-600 to-violet-600"
        shadow="shadow-blue-500/15"
        action={
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-60 text-sm font-semibold shadow-md w-full sm:w-auto shrink-0 transition-colors"
          >
            <Download size={16} />
            {downloading ? 'Generating…' : 'Download'}
          </button>
        }
      >
        <BannerStatGrid
          items={[
            { label: 'Investment', value: `₹${(totalInvestment / 100000).toFixed(1)}L`, icon: TrendingUp, gradient: 'from-amber-300 to-orange-400' },
            { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: ShoppingBag, gradient: 'from-sky-300 to-blue-400' },
            { label: 'Profit', value: `₹${(totalProfitFix / 100000).toFixed(1)}L`, icon: Award, gradient: totalProfitFix >= 0 ? 'from-emerald-300 to-teal-400' : 'from-red-300 to-rose-400' },
            { label: 'Avg / Car', value: `₹${(avgProfitPerCar / 1000).toFixed(0)}K`, icon: Users, gradient: 'from-violet-300 to-purple-400' },
          ]}
        />
      </DashboardBanner>

      {/* Period filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Staff performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardSection
          title="Sales Team"
          subtitle="Revenue & profit by staff"
          count={salesData.length}
          headerClass="bg-gradient-to-r from-blue-50/80 to-indigo-50/80"
          headerAccent="from-blue-500 to-indigo-500"
        >
          {salesData.length === 0 ? (
            <EmptyState icon={Users} title="No sales data" subtitle={`No sales recorded for this ${periodLabel.toLowerCase()} period.`} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                {salesData.map((staff) => (
                  <StaffCard
                    key={staff.name}
                    name={staff.name}
                    role="Sales"
                    accent="border-blue-100 bg-blue-50/40"
                    rows={[
                      { label: 'Sales', value: `${staff.sales} units` },
                      { label: 'Revenue', value: `₹${(staff.revenue / 100000).toFixed(2)}L` },
                      { label: 'Profit', value: `₹${(staff.profit / 1000).toFixed(0)}K`, highlight: staff.profit >= 0 ? 'text-emerald-600' : 'text-red-500' },
                      { label: 'Incentive', value: `₹${staff.incentives.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, highlight: 'text-indigo-600' },
                    ]}
                  />
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto -mx-1">
                <table className="w-full text-left min-w-[480px]">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider border-b border-slate-100">
                      <th className="pb-2 px-2">Staff</th>
                      <th className="pb-2 px-2">Sales</th>
                      <th className="pb-2 px-2 text-right">Revenue</th>
                      <th className="pb-2 px-2 text-right">Profit</th>
                      <th className="pb-2 px-2 text-right">Incentive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {salesData.map((staff) => (
                      <tr key={staff.name} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2 text-sm font-semibold text-slate-800">{staff.name}</td>
                        <td className="py-3 px-2 text-sm text-slate-600">{staff.sales}</td>
                        <td className="py-3 px-2 text-sm font-bold text-right">₹{(staff.revenue / 100000).toFixed(2)}L</td>
                        <td className={`py-3 px-2 text-sm font-bold text-right ${staff.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          ₹{(staff.profit / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-2 text-sm font-bold text-indigo-600 text-right">
                          ₹{staff.incentives.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DashboardSection>

        <DashboardSection
          title="Purchase Team"
          subtitle="Acquisition & investment"
          count={purchaseData.length}
          headerClass="bg-gradient-to-r from-emerald-50/80 to-teal-50/80"
          headerAccent="from-emerald-500 to-teal-500"
        >
          {purchaseData.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No purchase data" subtitle="No acquisitions in this period." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                {purchaseData.map((staff) => (
                  <StaffCard
                    key={staff.name}
                    name={staff.name}
                    role="Purchase"
                    accent="border-emerald-100 bg-emerald-50/40"
                    rows={[
                      { label: 'Bought', value: `${staff.purchases} units` },
                      { label: 'In Pipeline', value: `${staff.stockActive}` },
                      { label: 'Investment', value: `₹${(staff.investment / 100000).toFixed(2)}L`, highlight: 'text-slate-900' },
                    ]}
                  />
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto -mx-1">
                <table className="w-full text-left min-w-[400px]">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider border-b border-slate-100">
                      <th className="pb-2 px-2">Staff</th>
                      <th className="pb-2 px-2">Bought</th>
                      <th className="pb-2 px-2">Pipeline</th>
                      <th className="pb-2 px-2 text-right">Investment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {purchaseData.map((staff) => (
                      <tr key={staff.name} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2 text-sm font-semibold text-slate-800">{staff.name}</td>
                        <td className="py-3 px-2 text-sm text-slate-600">{staff.purchases}</td>
                        <td className="py-3 px-2">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{staff.stockActive} active</span>
                        </td>
                        <td className="py-3 px-2 text-sm font-bold text-right">₹{(staff.investment / 100000).toFixed(2)}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DashboardSection>
      </div>

      {/* Distribution charts */}
      {(salesData.length > 0 || purchaseData.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salesData.length > 0 && (
            <DashboardSection title="Sales Distribution" subtitle="Share by staff" headerAccent="from-blue-500 to-indigo-500">
              <div className="h-[220px] sm:h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={salesData} dataKey="sales" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4}>
                      {salesData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DashboardSection>
          )}
          {purchaseData.length > 0 && (
            <DashboardSection title="Stock Acquisition" subtitle="Share by purchaser" headerAccent="from-emerald-500 to-teal-500">
              <div className="h-[220px] sm:h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={purchaseData} dataKey="purchases" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4}>
                      {purchaseData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[(i + 1) % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DashboardSection>
          )}
        </div>
      )}

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardSection
          title="Profit Trend"
          subtitle="12-month performance"
          headerAccent="from-blue-500 to-indigo-500"
          className="lg:col-span-2"
          bodyClassName="p-3 sm:p-4"
        >
          <ProfitChart embedded title="Monthly Performance" subtitle="Investment vs revenue vs profit" />
        </DashboardSection>
        <DashboardSection title="Expenses" subtitle="Category breakdown" headerAccent="from-violet-500 to-purple-500" bodyClassName="p-3 sm:p-4">
          <ExpenseChart embedded />
        </DashboardSection>
      </div>

      {/* Unit economics */}
      {carProfitData.length > 0 && (
        <DashboardSection
          title="Unit Economics"
          subtitle="Profit per sold vehicle"
          count={carProfitData.length}
          headerAccent="from-emerald-500 to-teal-500"
        >
          <div className="h-[240px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carProfitData} margin={{ top: 4, right: 8, left: -16, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" height={50} interval={0} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {carProfitData.map((entry, i) => (
                    <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
      )}
    </DashboardPage>
  );
}
