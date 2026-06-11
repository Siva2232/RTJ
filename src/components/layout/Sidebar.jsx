import { memo, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Car, ShoppingCart, TrendingUp, BarChart3,
  PanelLeftClose, PanelLeftOpen, Users, X, LogOut, Zap,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar, setSidebarCollapsed } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';
import useMediaQuery from '../../hooks/useMediaQuery';
import UserAvatar from '../ui/UserAvatar';

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', color: 'text-sky-400', bg: 'bg-sky-500/20' },
    { label: 'Inventory', icon: Car, to: '/inventory', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Purchase', icon: ShoppingCart, to: '/purchase', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { label: 'Sales', icon: TrendingUp, to: '/sales', color: 'text-rose-400', bg: 'bg-rose-500/20' },
    { label: 'Team', icon: Users, to: '/team', color: 'text-violet-400', bg: 'bg-violet-500/20' },
    { label: 'Reports', icon: BarChart3, to: '/reports', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  ],
  purchase: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/purchase', color: 'text-sky-400', bg: 'bg-sky-500/20' },
    { label: 'Inventory', icon: Car, to: '/inventory', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  ],
  sales: [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/sales', color: 'text-sky-400', bg: 'bg-sky-500/20' },
    { label: 'Inventory', icon: Car, to: '/inventory', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  ],
};

const ROLE_LABELS = { admin: 'Admin', purchase: 'Purchase', sales: 'Sales' };

const NavItem = memo(function NavItem({ to, label, icon: Icon, color, bg, showLabels, centerIcon, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={to !== '/inventory'}
      onClick={onNavigate}
      title={!showLabels ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl text-[13px] font-medium ${
          centerIcon ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
        } ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : bg}`}>
            <Icon size={17} className={isActive ? 'text-white' : color} strokeWidth={2} />
          </span>
          {showLabels && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
});

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed);
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const navItems = useMemo(() => NAV_ITEMS[user?.role] || [], [user?.role]);
  const isDrawerOpen = isMobile && !collapsed;
  const showLabels = isMobile || !collapsed;
  const centerIcon = collapsed && !isMobile;
  const sidebarWidth = isMobile ? 300 : (collapsed ? 76 : 260);

  useEffect(() => {
    if (isMobile) dispatch(setSidebarCollapsed(true));
  }, [isMobile, dispatch]);

  useEffect(() => {
    if (!isMobile) return undefined;
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, isDrawerOpen]);

  const closeDrawer = useCallback(() => {
    if (isMobile) dispatch(setSidebarCollapsed(true));
  }, [isMobile, dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  }, [dispatch, navigate]);

  const goProfile = useCallback(() => {
    navigate('/profile');
    closeDrawer();
  }, [navigate, closeDrawer]);

  return (
    <>
      {isDrawerOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-indigo-950/50 z-[55] lg:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-[100dvh] z-[60] flex flex-col flex-shrink-0 bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-950 shadow-xl shadow-indigo-950/30 will-change-transform lg:will-change-auto ${
          isMobile && collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          width: sidebarWidth,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          transition: isMobile ? 'transform 0.2s ease-out' : 'width 0.2s ease-out',
        }}
      >
        <div className={`flex items-center h-[4.25rem] shrink-0 border-b border-white/10 ${showLabels ? 'px-5' : 'px-3 justify-center'}`}>
          <div className={`flex items-center min-w-0 ${showLabels ? 'gap-3 flex-1' : 'justify-center'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            {showLabels && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-[15px] font-bold text-white leading-none">
                  VTJ<span className="text-blue-400">Motors</span>
                </p>
                <p className="text-[11px] text-blue-300/70 mt-1">Dealer Management</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {showLabels && (
            <p className="px-3 mb-2 text-[11px] font-semibold text-blue-300/50 uppercase tracking-wider">Menu</p>
          )}
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              showLabels={showLabels}
              centerIcon={centerIcon}
              onNavigate={closeDrawer}
            />
          ))}
        </nav>

        <div className={`shrink-0 border-t border-white/10 ${showLabels ? 'p-4' : 'p-3'}`}>
          <button
            type="button"
            onClick={goProfile}
            className={`flex items-center w-full text-left hover:opacity-90 ${showLabels ? 'gap-3' : 'justify-center'}`}
          >
            <UserAvatar user={user} size="sm" className="!rounded-full" />
            {showLabels && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-blue-300/60 capitalize">{ROLE_LABELS[user?.role] || user?.role}</p>
              </div>
            )}
          </button>
          {showLabels && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-rose-300 hover:text-white hover:bg-rose-500/20 border border-rose-500/20"
            >
              <LogOut size={15} />
              Sign out
            </button>
          )}
        </div>

        <div className="hidden lg:block border-t border-white/10 p-2">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={`w-full flex items-center gap-2 rounded-xl py-2 text-blue-300/60 hover:text-white hover:bg-white/10 text-[13px] ${
              showLabels ? 'px-3' : 'justify-center px-0'
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {showLabels && <span>{collapsed ? 'Expand' : 'Collapse'}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
