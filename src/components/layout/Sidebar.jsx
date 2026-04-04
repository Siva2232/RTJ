import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, ShoppingCart, TrendingUp, BarChart3,
  ChevronRight, Zap, ShieldCheck,Users 
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

  // Close sidebar when link is clicked on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleSidebar())}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{
          x: collapsed && window.innerWidth < 1024 ? -300 : 0,
          width: collapsed && window.innerWidth >= 1024 ? 88 : 280,
        }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="fixed lg:static top-0 left-0 h-screen bg-slate-950 border-r border-slate-800/60 flex flex-col z-[60] shadow-2xl overflow-hidden flex-shrink-0"
      >
        {/* Branding Header */}
        <div className="flex items-center h-20 px-6 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition" />
              <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                <Zap size={20} className="text-blue-500" />
              </div>
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <span className="text-white font-black text-lg tracking-tight uppercase">VTJ<span className="text-blue-500">Motors</span></span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Enterprise Hub</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to !== '/inventory'}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group overflow-hidden ${
                  isActive
                    ? 'text-white bg-slate-900/80'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent border-l-4 border-blue-500"
                    />
                  )}
                  <Icon 
                    size={20} 
                    className={`relative z-10 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-white'}`} 
                  />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative z-10 whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 mt-auto border-t border-slate-800/50">
          <div className={`p-3 rounded-3xl bg-slate-900/40 border border-slate-800/50 transition-all ${collapsed ? 'text-center' : ''}`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-blue-400">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-sm font-bold truncate">{user?.name || 'Administrator'}</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span className="text-slate-500 font-medium uppercase tracking-wide">{user?.role}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="pb-6 text-center">
          <span className="text-slate-700 text-[9px] font-black tracking-[0.4em] uppercase">
            {collapsed ? 'v24' : 'Engine v24.0.1'}
          </span>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 border border-slate-700 rounded-2xl items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-all shadow-xl"
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
            <ChevronRight size={16} />
          </motion.div>
        </button>
      </motion.aside>
    </>
  );
}