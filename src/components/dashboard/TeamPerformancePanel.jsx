import { ShoppingCart, TrendingUp, Car, DollarSign, Users } from 'lucide-react';
import { DashboardSection } from './DashboardUI';

const AVATAR_GRADIENT = {
  admin: 'from-slate-700 to-slate-900',
  purchase: 'from-amber-500 to-orange-600',
  sales: 'from-emerald-500 to-teal-600',
};

const fmtShort = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${(n || 0).toLocaleString('en-IN')}`;
};

function UserStatCard({ name, role, highlight, children, accent }) {
  const gradient = AVATAR_GRADIENT[role] || AVATAR_GRADIENT.purchase;
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        highlight
          ? 'border-blue-300 bg-blue-50/60 ring-2 ring-blue-200 shadow-sm'
          : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 text-sm truncate">{name}</p>
          <p className={`text-[10px] font-semibold uppercase tracking-wide capitalize ${accent || 'text-slate-500'}`}>
            {role || 'team'}
            {highlight && <span className="ml-1.5 text-blue-600">· You</span>}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div className="rounded-lg bg-white border border-slate-100 px-2.5 py-2 text-center">
      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-base font-black mt-0.5 ${color || 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

export function PurchaseTeamPanel({ stats, highlightUserId, compact = false, mode = 'team' }) {
  const isPersonal = mode === 'personal';
  const displayStats = isPersonal && highlightUserId
    ? stats.filter((s) => String(s.id) === String(highlightUserId))
    : stats;

  return (
    <DashboardSection
      title={isPersonal ? 'My Purchase Performance' : 'Team Purchase Performance'}
      subtitle={isPersonal ? 'Your sourcing record' : 'Cars sourced per purchase team member'}
      count={isPersonal ? undefined : displayStats.length}
      headerClass="bg-gradient-to-r from-amber-500 to-orange-500 [&_h3]:!text-white [&_p]:!text-amber-100"
      headerAccent="from-amber-400 to-orange-400"
      badge={<ShoppingCart size={16} className="text-white" />}
      className={compact ? '' : undefined}
    >
      {displayStats.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No purchase records yet</p>
      ) : (
        <div className={`grid gap-3 ${isPersonal ? 'grid-cols-1 max-w-md' : compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {displayStats.map((u) => (
            <UserStatCard
              key={u.id}
              name={u.name}
              role={u.role}
              highlight={highlightUserId && String(highlightUserId) === String(u.id)}
              accent="text-amber-600"
            >
              <div className="grid grid-cols-3 gap-2">
                <StatChip label="Purchased" value={u.total} color="text-blue-700" />
                <StatChip label="Active" value={u.active} color="text-emerald-600" />
                <StatChip label="Sold" value={u.sold} color="text-violet-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5 flex items-center gap-1">
                <DollarSign size={11} className="text-amber-500" />
                Investment: <span className="font-bold text-slate-800">{fmtShort(u.investment)}</span>
              </p>
            </UserStatCard>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

export function SalesTeamPanel({ stats, highlightUserId, compact = false, mode = 'team' }) {
  const isPersonal = mode === 'personal';
  const displayStats = isPersonal && highlightUserId
    ? stats.filter((s) => String(s.id) === String(highlightUserId))
    : stats;

  return (
    <DashboardSection
      title={isPersonal ? 'My Sales Performance' : 'Team Sales Performance'}
      subtitle={isPersonal ? 'Your sales record' : 'Vehicles sold per sales team member'}
      count={isPersonal ? undefined : displayStats.length}
      headerClass="bg-gradient-to-r from-emerald-600 to-teal-600 [&_h3]:!text-white [&_p]:!text-emerald-100"
      headerAccent="from-emerald-400 to-teal-400"
      badge={<TrendingUp size={16} className="text-white" />}
      className={compact ? '' : undefined}
    >
      {displayStats.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No sales records yet</p>
      ) : (
        <div className={`grid gap-3 ${isPersonal ? 'grid-cols-1 max-w-md' : compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {displayStats.map((u) => (
            <UserStatCard
              key={u.id}
              name={u.name}
              role={u.role}
              highlight={highlightUserId && String(highlightUserId) === String(u.id)}
              accent="text-emerald-600"
            >
              <div className="grid grid-cols-3 gap-2">
                <StatChip label="Sold" value={u.sold} color="text-violet-700" />
                <StatChip label="Pending" value={u.pending} color="text-orange-600" />
                <StatChip
                  label="Profit"
                  value={fmtShort(u.profit)}
                  color={u.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5 flex items-center gap-1">
                <DollarSign size={11} className="text-emerald-500" />
                Revenue: <span className="font-bold text-slate-800">{fmtShort(u.revenue)}</span>
              </p>
            </UserStatCard>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

export function TeamPerformanceSummary({ purchaseStats, salesStats }) {
  const totalPurchased = purchaseStats.reduce((s, u) => s + u.total, 0);
  const totalSold = salesStats.reduce((s, u) => s + u.sold, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Purchase Team', value: purchaseStats.length, sub: `${totalPurchased} cars sourced`, icon: Users, color: 'from-amber-500 to-orange-500' },
        { label: 'Cars Purchased', value: totalPurchased, sub: 'All team members', icon: Car, color: 'from-blue-500 to-indigo-500' },
        { label: 'Sales Team', value: salesStats.length, sub: `${totalSold} cars sold`, icon: Users, color: 'from-emerald-500 to-teal-500' },
        { label: 'Cars Sold', value: totalSold, sub: 'Completed sales', icon: ShoppingCart, color: 'from-violet-500 to-purple-500' },
      ].map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="rounded-xl bg-white border border-slate-200 p-3 sm:p-4 shadow-sm">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2 shadow-sm`}>
            <Icon size={16} className="text-white" />
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{value}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
