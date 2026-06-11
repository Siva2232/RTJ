import { useState } from 'react';
import { Car } from 'lucide-react';
import { getImageUrl } from '../../utils/helper';

export function DashboardPage({ children, className = '' }) {
  return (
    <div className={`p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto w-full ${className}`}>
      {children}
    </div>
  );
}

export function DashboardBanner({
  eyebrow,
  title,
  description,
  gradient = 'from-blue-600 via-indigo-600 to-violet-600',
  shadow = 'shadow-blue-500/20',
  action,
  children,
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-r ${gradient} p-4 sm:p-5 text-white shadow-lg ${shadow}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="text-white/70 text-xs font-medium tracking-wide">{eyebrow}</p>}
          <h2 className="text-lg sm:text-xl font-bold mt-0.5 tracking-tight">{title}</h2>
          {description && <p className="text-white/75 text-xs sm:text-sm mt-1 max-w-xl">{description}</p>}
        </div>
        {action}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function BannerStatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {items.map(({ label, value, icon: Icon, gradient }) => (
        <div
          key={label}
          className="bg-white/12 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/15 hover:bg-white/18 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={14} className="text-white/80 shrink-0" />}
            <p className="text-[10px] sm:text-xs text-white/70 font-medium truncate">{label}</p>
          </div>
          <p className="text-white font-bold text-base sm:text-lg leading-none">{value}</p>
          {gradient && <div className={`h-0.5 w-8 mt-2 rounded-full bg-gradient-to-r ${gradient}`} />}
        </div>
      ))}
    </div>
  );
}

export function DashboardSection({
  id,
  title,
  subtitle,
  count,
  badge,
  headerClass = 'bg-slate-50',
  headerAccent,
  children,
  className = '',
  bodyClassName = 'p-3 sm:p-4',
  scrollable = false,
}) {
  return (
    <section
      id={id}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      <header className={`relative px-4 py-3 border-b border-slate-100 shrink-0 ${headerClass}`}>
        {headerAccent && (
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${headerAccent}`} />
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-900 tracking-tight">
              {title}
              {count !== undefined && <span className="text-slate-400 font-normal"> ({count})</span>}
            </h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {badge}
        </div>
      </header>
      <div className={`${bodyClassName} flex-1 min-h-0 ${scrollable ? 'overflow-y-auto' : ''}`}>
        {children}
      </div>
    </section>
  );
}

function CarThumbPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Car size={24} className="text-slate-300" />
    </div>
  );
}

export function CarThumb({ car, className = 'h-28', imgClassName = '' }) {
  const src = car.images?.[0] || car.repairImages?.[0];
  const [imgError, setImgError] = useState(false);
  const url = src ? getImageUrl(src) : null;

  return (
    <div className={`w-full ${className} bg-slate-100 overflow-hidden`}>
      {url && !imgError ? (
        <img
          src={url}
          alt=""
          className={`w-full h-full object-cover ${imgClassName}`}
          onError={() => setImgError(true)}
        />
      ) : (
        <CarThumbPlaceholder />
      )}
    </div>
  );
}

export function VehicleGridCard({ children, className = '', onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group text-left rounded-xl border border-slate-200/80 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200 ${className}`}
    >
      {children}
    </Comp>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <Icon size={24} className="text-slate-400" />
        </div>
      )}
      <p className="text-slate-700 text-sm font-semibold">{title}</p>
      {subtitle && <p className="text-slate-400 text-xs mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
