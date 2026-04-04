import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSelector } from 'react-redux';
import { selectAllCars } from '../../store/slices/carSlice';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-800">{payload[0].name}</p>
      <p className="text-slate-500 mt-1">₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

export default function ExpenseChart() {
  const cars = useSelector(selectAllCars);

  // Aggregate all expenses by category
  const categoryMap = {};
  cars.forEach((car) => {
    [...(car.purchaseExpenses || []), ...(car.repairCosts || [])].forEach(({ title, category, amount }) => {
      const key = title || category || 'Other';
      categoryMap[key] = (categoryMap[key] || 0) + (amount || 0);
    });
  });

  const data = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">No expense data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-slate-900 font-semibold text-base">Expense Breakdown</h3>
        <p className="text-slate-500 text-sm">By category across all cars</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px' }}
            formatter={(value) => <span style={{ color: '#64748b' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
