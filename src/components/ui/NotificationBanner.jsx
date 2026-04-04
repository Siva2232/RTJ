import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

const TYPE_CONFIG = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: CheckCircle2,
    titleColor: 'text-emerald-900',
    textColor: 'text-emerald-700'
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    icon: AlertCircle,
    titleColor: 'text-rose-900',
    textColor: 'text-rose-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: Info,
    titleColor: 'text-blue-900',
    textColor: 'text-blue-700'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: AlertCircle,
    titleColor: 'text-amber-900',
    textColor: 'text-amber-700'
  }
};

export default function NotificationBanner({ 
  id, 
  title, 
  message, 
  type = 'info', 
  onDismiss,
  actionLabel,
  onAction
}) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`relative group overflow-hidden rounded-2xl border ${config.bg} ${config.border} p-4 shadow-sm`}
    >
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg} ${config.iconColor}`}>
          <Icon size={20} />
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-bold text-sm truncate ${config.titleColor}`}>
              {title}
            </h4>
          </div>
          <p className={`text-sm mt-0.5 leading-relaxed ${config.textColor}`}>
            {message}
          </p>
          
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`mt-2 text-xs font-bold uppercase tracking-wider ${config.iconColor} hover:underline`}
            >
              {actionLabel}
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(id)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-white/50 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Progress Bar (Visual only) */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-10 w-full" />
    </motion.div>
  );
}
