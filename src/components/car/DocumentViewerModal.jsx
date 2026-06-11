import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Image as ImageIcon, ExternalLink, Download, Receipt } from 'lucide-react';
import { getImageUrl, isPdfUrl } from '../../utils/helper';

export default function DocumentViewerModal({ isOpen, onClose, documentPath, expense }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!documentPath) return null;

  const url = getImageUrl(documentPath);
  const isPdf = isPdfUrl(documentPath);
  const fileName = documentPath.split('/').pop() || 'document';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                  {isPdf ? <FileText size={22} /> : <ImageIcon size={22} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {isPdf ? 'PDF Document' : 'Receipt Image'}
                  </p>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {expense?.title || 'Expense Bill'}
                  </h2>
                  {expense?.amount != null && (
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      ₹{Number(expense.amount).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <ExternalLink size={14} />
                  Open
                </a>
                <a
                  href={url}
                  download={fileName}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <Download size={14} />
                  Download
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-auto bg-slate-100/80 p-4 sm:p-6 min-h-[280px]">
              {isPdf ? (
                <div className="h-full min-h-[60vh] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner">
                  <iframe
                    src={url}
                    title={expense?.title || 'PDF document'}
                    className="w-full h-[60vh] sm:h-[65vh] border-0"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[50vh]">
                  <img
                    src={url}
                    alt={expense?.title || 'Bill receipt'}
                    className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-xl border border-white"
                  />
                </div>
              )}
            </div>

            {/* Mobile actions */}
            <div className="sm:hidden flex gap-2 p-4 border-t border-slate-100 bg-white">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-2xl"
              >
                <ExternalLink size={16} />
                Open
              </a>
              <a
                href={url}
                download={fileName}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-2xl"
              >
                <Download size={16} />
                Download
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
