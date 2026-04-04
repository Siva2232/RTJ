import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectAllCars, calcTotalCost, calcProfit, fetchCars } from '../store/slices/carSlice';
import ProfitChart from '../components/charts/ProfitChart';
import ExpenseChart from '../components/charts/ExpenseChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Users, TrendingUp, ShoppingBag, Award, Download } from 'lucide-react';
import api from '../services/api';

const PERIODS = [
  { key: 'weekly',  label: 'Weekly'  },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly',  label: 'Yearly'  },
];

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

export default function Reports() {
  const dispatch = useDispatch();
  const cars = useSelector(selectAllCars);
  const [period, setPeriod] = useState('monthly');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  // ─── Period filtering ───
  const periodStart = getPeriodStart(period);

  const filteredSoldCars = cars.filter(
    (c) => c.status === 'sold' && c.soldDate && new Date(c.soldDate) >= periodStart
  );

  const filteredAllCars = cars.filter((c) => {
    const d = c.purchaseDate || c.createdAt;
    return d && new Date(d) >= periodStart;
  });

  // Use period-filtered cars for all calculations below
  const soldCars = filteredSoldCars;

  // ─── Staff Performance Logic ───
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

  // Per-car profit data
  const carProfitData = soldCars.map((c) => ({
    name: `${c.brand} ${c.model}`.slice(0, 16),
    profit: calcProfit(c),
    cost: calcTotalCost(c),
    sold: c.sellingPrice,
  }));

  const totalInvestment = filteredAllCars.reduce((s, c) => s + calcTotalCost(c), 0);
  const totalRevenue = soldCars.reduce((s, c) => s + c.sellingPrice, 0);
  const totalProfitFix = soldCars.reduce((s, c) => s + calcProfit(c), 0);
  const avgProfitPerCar = soldCars.length ? Math.round(totalProfitFix / soldCars.length) : 0;

  // ─── Download Report ───
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
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-900 text-2xl font-bold">Business Intelligence</h2>
          <p className="text-slate-500 text-sm mt-0.5">Advanced performance analytics & staff tracking</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period filter */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Download Report */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Download size={15} />
            {downloading ? 'Generating…' : 'Download Report'}
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <Users size={18} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-700">{salesData.length + purchaseData.length} Active Staff</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Investment', value: `₹${(totalInvestment / 100000).toFixed(1)}L`, color: 'text-amber-600', icon: TrendingUp },
          { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, color: 'text-blue-600', icon: ShoppingBag },
          { label: 'Total Profit', value: `₹${(totalProfitFix / 100000).toFixed(1)}L`, color: totalProfitFix >= 0 ? 'text-emerald-600' : 'text-red-500', icon: Award },
          { label: 'Avg Profit/Car', value: `₹${(avgProfitPerCar / 1000).toFixed(0)}K`, color: 'text-violet-600', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">{label}</p>
              <p className={`font-black text-2xl ${color}`}>{value}</p>
            </div>
            <Icon className="absolute -right-2 -bottom-2 w-16 h-16 text-slate-50 opacity-[0.03]" />
          </motion.div>
        ))}
      </div>

      {/* ─── Staff Performance Section ─── */}
      <div className="grid grid-cols-1 gap-8">
        {/* Sales Team Analysis */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-slate-900 font-bold text-lg">Sales Team Performance</h3>
              <p className="text-slate-500 text-xs">Revenue & Profit generated by sales staff</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                  <th className="pb-3 px-2">Sales Staff</th>
                  <th className="pb-3 px-2">Total Sales</th>
                  <th className="pb-3 px-2 text-right">Revenue</th>
                  <th className="pb-3 px-2 text-right">Net Profit</th>
                  <th className="pb-3 px-2 text-right text-indigo-600">Incentive (2%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salesData.map((staff) => (
                  <tr key={staff.name} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2">
                       <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-500 border border-blue-100">
                          {staff.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{staff.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-slate-600 font-medium">{staff.sales} units</td>
                    <td className="py-4 px-2 text-sm font-bold text-slate-900 text-right">₹{(staff.revenue / 100000).toFixed(2)}L</td>
                    <td className="py-4 px-2 text-right">
                      <span className={`text-sm font-bold ${staff.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        ₹{(staff.profit / 1000).toFixed(0)}K
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="text-sm font-black text-indigo-600">
                        ₹{staff.incentives.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Team Analysis */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-slate-900 font-bold text-lg">Purchase Team Performance</h3>
              <p className="text-slate-500 text-xs">Stock acquisition & investment by purchase staff</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                  <th className="pb-3 px-2">Purchase Staff</th>
                  <th className="pb-3 px-2">Total Bought</th>
                  <th className="pb-3 px-2">Active Stock</th>
                  <th className="pb-3 px-2 text-right">Total Investment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchaseData.map((staff) => (
                  <tr key={staff.name} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2">
                       <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-500 border border-emerald-100">
                          {staff.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{staff.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-slate-600 font-medium">{staff.purchases} units</td>
                    <td className="py-4 px-2">
                       <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                         {staff.stockActive} In Pipeline
                       </span>
                    </td>
                    <td className="py-4 px-2 text-sm font-bold text-slate-900 text-right">₹{(staff.investment / 100000).toFixed(2)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Distribution Chart moved here */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-slate-900 font-bold text-lg mb-1">Sales Distribution</h3>
            <p className="text-slate-500 text-xs mb-6">Market share by staff members</p>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={salesData}
                    dataKey="sales"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* New Purchase Distribution Chart */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-slate-900 font-bold text-lg mb-1">Stock Acquisition</h3>
            <p className="text-slate-500 text-xs mb-6">Inventory contribution by purchase team</p>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={purchaseData}
                    dataKey="purchases"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                  >
                    {purchaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfitChart />
        </div>
        <ExpenseChart />
      </div>

      {/* Per-car Profit Bar Chart */}
      {carProfitData.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h3 className="text-slate-900 font-bold text-lg mb-1">Unit Economics</h3>
          <p className="text-slate-500 text-xs mb-8">Profitability tracking per individual vehicle</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={carProfitData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} angle={-25} textAnchor="end" />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]} barSize={32}>
                {carProfitData.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
