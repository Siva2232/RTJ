const statusConfig = {
  purchased: { label: 'Purchased', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  repair: { label: 'In Repair', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  ready: { label: 'Ready', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  sale_pending: { label: 'Sale Pending', cls: 'bg-orange-100 text-orange-700 border border-orange-200 animate-pulse' },
  sold: { label: 'Sold', cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
};

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
}

export function ProfitBadge({ profit }) {
  if (!profit) return null;
  const isProfit = profit > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
        isProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {isProfit ? '↑' : '↓'} ₹{Math.abs(profit).toLocaleString('en-IN')}
    </span>
  );
}

export function RoleBadge({ role }) {
  const map = {
    admin: 'bg-slate-900 text-white',
    purchase: 'bg-blue-100 text-blue-800',
    sales: 'bg-emerald-100 text-emerald-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[role] || 'bg-slate-100 text-slate-600'}`}>
      {role}
    </span>
  );
}
