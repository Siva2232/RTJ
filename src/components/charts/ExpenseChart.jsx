import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import { selectAllCars } from '../../store/slices/carSlice';
import { ShoppingCart, FileText, Wrench, Target, Receipt } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1'];

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtShort = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return fmt(n);
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-800">{payload[0].name}</p>
      <p className="text-slate-500 mt-1">{fmt(payload[0].value)}</p>
    </div>
  );
};

function SummaryCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div className={`rounded-xl p-4 sm:p-5 border ${bg} ${border}`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 shadow-sm`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 truncate">{fmtShort(value)}</p>
      <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">{fmt(value)}</p>
    </div>
  );
}

export default function ExpenseChart({ embedded = false, layout = 'default' }) {
  const cars = useSelector(selectAllCars);

  const { categoryData, purchaseTotal, sourcingTotal, repairTotal, grandTotal } = useMemo(() => {
    const categoryMap = {};
    let purchase = 0;
    let sourcing = 0;
    let repair = 0;

    cars.forEach((car) => {
      purchase += car.purchasePrice || 0;
      (car.purchaseExpenses || []).forEach(({ title, category, amount }) => {
        const key = title || category || 'Other Expense';
        const val = amount || 0;
        sourcing += val;
        categoryMap[key] = (categoryMap[key] || 0) + val;
      });
      (car.repairCosts || []).forEach(({ title, category, amount }) => {
        const key = title || category || 'Repair';
        const val = amount || 0;
        repair += val;
        categoryMap[key] = (categoryMap[key] || 0) + val;
      });
    });

    const data = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      categoryData: data,
      purchaseTotal: purchase,
      sourcingTotal: sourcing,
      repairTotal: repair,
      grandTotal: purchase + sourcing + repair,
    };
  }, [cars]);

  const topCategories = categoryData.slice(0, 8);
  const expenseOnlyTotal = sourcingTotal + repairTotal;

  if (!cars.length || grandTotal === 0) {
    const empty = <p className="text-slate-400 text-sm text-center py-16">No expense data yet</p>;
    if (embedded) return empty;
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        {empty}
      </div>
    );
  }

  const breakdownItems = [
    { label: 'Purchase Price', value: purchaseTotal, color: 'bg-blue-500', pct: grandTotal ? (purchaseTotal / grandTotal) * 100 : 0 },
    { label: 'Expenses', value: sourcingTotal, color: 'bg-sky-400', pct: grandTotal ? (sourcingTotal / grandTotal) * 100 : 0 },
    { label: 'Repair Costs', value: repairTotal, color: 'bg-amber-500', pct: grandTotal ? (repairTotal / grandTotal) * 100 : 0 },
  ];

  const gridContent = (
    <div className="space-y-5 sm:space-y-6">
      {/* Summary stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard icon={ShoppingCart} label="Purchase Price" value={purchaseTotal} color="bg-blue-600" bg="bg-blue-50/80" border="border-blue-100" />
        <SummaryCard icon={FileText} label="Expenses" value={sourcingTotal} color="bg-sky-500" bg="bg-sky-50/80" border="border-sky-100" />
        <SummaryCard icon={Wrench} label="Repair Costs" value={repairTotal} color="bg-amber-500" bg="bg-amber-50/80" border="border-amber-100" />
        <SummaryCard icon={Target} label="Total Investment" value={grandTotal} color="bg-violet-600" bg="bg-violet-50/80" border="border-violet-100" />
      </div>

      {/* Cost breakdown bar */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Target size={16} className="text-violet-500" />
              Cost Breakdown
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">How total investment is distributed</p>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">{fmtShort(grandTotal)}</p>
        </div>
        <div className="flex h-4 sm:h-5 rounded-full overflow-hidden bg-white border border-slate-200">
          {breakdownItems.map((item) => (
            item.pct > 0 && (
              <div
                key={item.label}
                className={`${item.color} transition-all`}
                style={{ width: `${item.pct}%` }}
                title={`${item.label}: ${fmt(item.value)}`}
              />
            )
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {breakdownItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between sm:justify-start gap-3 bg-white rounded-lg px-3 py-2.5 border border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
                <span className="text-xs font-medium text-slate-600 truncate">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-slate-900 shrink-0">{fmtShort(item.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + category grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Pie chart */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4">
            <h4 className="font-bold text-slate-900 text-sm">Expense Categories</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {expenseOnlyTotal > 0 ? `${topCategories.length} categories · ${fmtShort(expenseOnlyTotal)} total` : 'No line-item expenses logged'}
            </p>
          </div>
          {topCategories.length > 0 ? (
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {topCategories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No category expenses yet</div>
          )}
        </div>

        {/* Category breakdown grid */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Category Breakdown</h4>
              <p className="text-xs text-slate-500 mt-0.5">Top spending by expense type</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Logged Expenses</p>
              <p className="text-base font-black text-violet-700">{fmtShort(expenseOnlyTotal)}</p>
            </div>
          </div>

          {topCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[320px] overflow-y-auto pr-1">
              {topCategories.map((item, i) => {
                const pct = expenseOnlyTotal ? ((item.value / expenseOnlyTotal) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      {pct}%
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{fmt(item.value)}</p>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden shrink-0 hidden sm:block">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt size={32} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 font-medium">No expense line items yet</p>
              <p className="text-xs text-slate-400 mt-1">Expenses appear when logged on vehicles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const defaultContent = (
    <>
      {!embedded && (
        <div className="mb-4">
          <h3 className="text-slate-900 font-semibold text-sm sm:text-base">Expense Breakdown</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">By category across all cars</p>
        </div>
      )}
      <p className="text-xs text-slate-500 mb-3">
        Total: <span className="font-bold text-slate-800">{fmt(expenseOnlyTotal)}</span>
      </p>
      <div className="h-[200px] sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={topCategories} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
              {topCategories.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  const content = layout === 'grid' ? gridContent : defaultContent;

  if (embedded) return <div>{content}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
      {content}
    </div>
  );
}
