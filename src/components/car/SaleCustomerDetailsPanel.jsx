import { User, Phone, MapPin, CreditCard, FileText, Eye, UserCheck } from 'lucide-react';
import { getImageUrl, isPdfUrl } from '../../utils/helper';

function DocLink({ label, path, onView, dark }) {
  if (!path) return null;
  const isPdf = isPdfUrl(path);
  return (
    <button
      type="button"
      onClick={() => onView?.({ billImage: path, expense: { title: label, amount: 0 } })}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-left w-full ${
        dark
          ? 'bg-white/10 border border-white/10 hover:bg-white/15'
          : 'bg-white border border-slate-200 hover:border-blue-200'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-50' : 'bg-blue-50'}`}>
        <FileText size={14} className={isPdf ? 'text-red-500' : 'text-blue-500'} />
      </div>
      <span className={`text-xs font-semibold flex-1 ${dark ? 'text-white/90' : 'text-slate-700'}`}>{label}</span>
      <Eye size={14} className={dark ? 'text-white/50' : 'text-slate-400'} />
    </button>
  );
}

export default function SaleCustomerDetailsPanel({
  customer,
  soldBy,
  soldDate,
  sellingPrice,
  variant = 'dark',
  onViewDocument,
}) {
  if (!customer?.name) return null;

  const isDark = variant === 'dark';
  const wrap = isDark
    ? 'bg-slate-900 rounded-3xl p-6 md:p-8 text-white'
    : 'bg-slate-50 rounded-2xl p-5 border border-slate-200';
  const labelCls = isDark ? 'text-xs uppercase text-slate-400' : 'text-[10px] font-bold uppercase tracking-wider text-slate-400';
  const valueCls = isDark ? 'font-bold text-lg' : 'font-bold text-slate-900';

  return (
    <div className={wrap}>
      <h3 className={`font-black text-xl mb-5 flex items-center gap-2 ${isDark ? '' : 'text-slate-900'}`}>
        <User size={20} className="text-emerald-500" />
        Buyer & Sale Records
      </h3>

      {soldBy?.name && (
        <div className={`mb-5 p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
            {soldBy.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <UserCheck size={10} /> Sold by
            </p>
            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{soldBy.name}</p>
            {soldBy.role && (
              <span className="text-[10px] font-semibold capitalize text-emerald-600">{soldBy.role}</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <p className={labelCls}>Customer</p>
          <p className={valueCls}>{customer.name}</p>
        </div>
        <div>
          <p className={labelCls}>Phone</p>
          <p className={valueCls}>{customer.phone || '—'}</p>
        </div>
        <div>
          <p className={labelCls}>Aadhar</p>
          <p className={valueCls}>{customer.aadharNumber || '—'}</p>
        </div>
        <div>
          <p className={labelCls}>PAN</p>
          <p className={`${valueCls} uppercase`}>{customer.panNumber || '—'}</p>
        </div>
        {customer.address && (
          <div className="sm:col-span-2">
            <p className={labelCls}>Address</p>
            <p className={isDark ? 'font-medium' : 'text-slate-700'}>{customer.address}</p>
          </div>
        )}
        {sellingPrice != null && (
          <div>
            <p className={labelCls}>Sale Price</p>
            <p className={`${valueCls} text-emerald-400`}>₹{Number(sellingPrice).toLocaleString('en-IN')}</p>
          </div>
        )}
        {soldDate && (
          <div>
            <p className={labelCls}>Sold On</p>
            <p className={valueCls}>
              {new Date(soldDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {(customer.bankAccountHolder || customer.bankAccountNumber) && (
        <div className={`mb-5 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-100'}`}>
          <p className={`${labelCls} mb-3 flex items-center gap-1`}>
            <CreditCard size={12} /> Bank Account
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className={labelCls}>Holder </span><span className={isDark ? 'text-white font-semibold' : 'font-semibold'}>{customer.bankAccountHolder || '—'}</span></div>
            <div><span className={labelCls}>Account </span><span className={isDark ? 'text-white font-semibold' : 'font-semibold'}>{customer.bankAccountNumber || '—'}</span></div>
            <div><span className={labelCls}>Bank </span><span className={isDark ? 'text-white font-semibold' : 'font-semibold'}>{customer.bankName || '—'}</span></div>
            <div><span className={labelCls}>IFSC </span><span className={`uppercase ${isDark ? 'text-white font-semibold' : 'font-semibold'}`}>{customer.bankIfsc || '—'}</span></div>
          </div>
        </div>
      )}

      {(customer.aadharDocument || customer.panDocument || customer.rcBookDocuments?.length > 0) && (
        <div className="space-y-2">
          <p className={labelCls}>Documents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DocLink dark={isDark} label="Aadhar Card" path={customer.aadharDocument} onView={onViewDocument} />
            <DocLink dark={isDark} label="PAN Card" path={customer.panDocument} onView={onViewDocument} />
            {(customer.rcBookDocuments || []).map((doc, i) => (
              <DocLink dark={isDark} key={i} label={`RC Book ${i + 1}`} path={doc} onView={onViewDocument} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
