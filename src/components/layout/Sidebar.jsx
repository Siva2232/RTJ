import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, ShoppingCart, TrendingUp, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Settings, Users,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
    { label: 'Inventory', icon: Car, to: '/inventory' },
    { label: 'Purchase', icon: ShoppingCart, to: '/purchase' },
    { label: 'Sales', icon: TrendingUp, to: '/sales' },
    { label: 'Team', icon: Users, to: '/team' },
    { label: 'Reports', icon: BarChart3, to: '/reports' },
  ],
  purchase: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/purchase' },
    { label: 'Inventory', icon: Car, to: '/inventory' },
  ],
  sales: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/sales' },
    { label: 'Inventory', icon: Car, to: '/inventory' },
  ],
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed);

  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-slate-900 border-r border-slate-800 flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Car size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-white font-bold text-sm leading-tight truncate">RTJ Motors</span>
                <span className="text-slate-400 text-xs leading-tight">Car Manager</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to !== '/inventory'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* CRM Version Branding */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity duration-300"
            >
              <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">CRM System</span>
              <div className="flex items-center gap-2">
                <span className="h-px w-4 bg-slate-700"></span>
                <span className="text-indigo-400 text-[11px] font-bold">V.24</span>
                <span className="h-px w-4 bg-slate-700"></span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50"
            >
              <span className="text-indigo-400 text-[9px] font-black italic">v24</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
