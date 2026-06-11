import { memo } from 'react';
import { FileText, Eye, Receipt, Trash2, CalendarDays } from 'lucide-react';
import { getImageUrl, isPdfUrl } from '../../utils/helper';

const VARIANTS = {
  purchase: {
    borderHover: 'hover:border-blue-200',
    dateBg: 'bg-blue-50',
    dateText: 'text-blue-600',
    dateSub: 'text-blue-400',
    viewBtn: 'bg-blue-600 hover:bg-blue-700',
    amountText: 'text-slate-900',
  },
  repair: {
    borderHover: 'hover:border-amber-200',
    dateBg: 'bg-amber-50',
    dateText: 'text-amber-600',
    dateSub: 'text-amber-400',
    viewBtn: 'bg-amber-500 hover:bg-amber-600',
    amountText: 'text-slate-900',
  },
};

function ExpenseDocumentCard({
  expense,
  variant = 'purchase',
  canDelete = false,
  onViewDocument,
  onDelete,
}) {
  const v = VARIANTS[variant] || VARIANTS.purchase;
  const hasDoc = !!expense.billImage;
  const url = hasDoc ? getImageUrl(expense.billImage) : null;
  const isPdf = hasDoc && isPdfUrl(expense.billImage);

  const expDate = expense.date ? new Date(expense.date) : null;
  const day = expDate ? expDate.getDate() : '—';
  const month = expDate ? expDate.toLocaleDateString('en-IN', { month: 'short' }) : '';
  const fullDate = expDate
    ? expDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No date';

  return (
    <div
      className={`group rounded-xl border border-slate-100 bg-white p-3 transition-colors duration-150 ${v.borderHover} hover:shadow-sm`}
    >
      <div className="flex items-center gap-3">
        {/* Date badge */}
        <div className={`w-10 h-10 rounded-lg ${v.dateBg} flex flex-col items-center justify-center flex-shrink-0`}>
          <span className={`text-sm font-black leading-none ${v.dateText}`}>{day}</span>
          <span className={`text-[8px] font-bold uppercase ${v.dateSub}`}>{month}</span>
        </div>

        {/* Title, date, amount — stacked to avoid overlap */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {expense.title}
            </p>
            <p className={`text-sm font-black flex-shrink-0 ${v.amountText}`}>
              ₹{expense.amount.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 truncate">
            <CalendarDays size={10} className="flex-shrink-0" />
            <span className="truncate">{fullDate}</span>
          </p>
        </div>

        {/* Document thumb + view */}
        {hasDoc ? (
          <button
            type="button"
            onClick={() => onViewDocument(expense)}
            className="flex items-center gap-2 flex-shrink-0 pl-2 border-l border-slate-100"
            title="View document"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
              {isPdf ? (
                <FileText size={16} className="text-red-500" />
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-white rounded-lg ${v.viewBtn}`}>
              <Eye size={11} />
              View
            </span>
          </button>
        ) : (
          <div
            className="w-10 h-10 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0"
            title="No receipt"
          >
            <Receipt size={14} className="text-slate-300" />
          </div>
        )}

        {canDelete && (
          <button
            onClick={() => onDelete(expense._id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            title="Remove expense"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(ExpenseDocumentCard);
