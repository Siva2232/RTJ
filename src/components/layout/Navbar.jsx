import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, ChevronDown, CheckCircle, XCircle, LogOut,
  User, ShieldCheck, AlertCircle, CalendarDays,
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { selectPendingSaleCars } from '../../store/slices/carSlice';
import { markRead, markAllAsRead } from '../../store/slices/notificationSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import UserAvatar from '../ui/UserAvatar';
import toast from 'react-hot-toast';

const ROLE_LABELS = { admin: 'Administrator', purchase: 'Purchase Team', sales: 'Sales Team' };
const ROLE_BADGE = {
  admin: 'bg-blue-100 text-blue-700',
  purchase: 'bg-amber-100 text-amber-700',
  sales: 'bg-emerald-100 text-emerald-700',
};

export default function Navbar({ title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const pendingSales = useSelector(selectPendingSaleCars);
  const { list: notifications, unreadCount } = useSelector((s) => s.notifications);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowLogoutModal(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const hasNotifications = user?.role === 'admin'
    ? pendingSales.length > 0 || unreadCount > 0
    : unreadCount > 0;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.admin;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-blue-100 shadow-sm">
      {/* Color accent bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

      <div className="h-[4rem] flex items-center justify-between px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 -ml-1 rounded-xl text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{title}</h1>
            <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
              <CalendarDays size={12} className="text-blue-500" />
              <p className="text-xs text-slate-500">{today}</p>
              <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadge}`}>
                {ROLE_LABELS[user?.role] || 'Dashboard'}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl transition-all ${
                showNotifications
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {hasNotifications && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[24rem] bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-blue-100 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      <p className="text-xs text-blue-100 mt-0.5">Recent activity</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => dispatch(markAllAsRead())}
                        className="text-xs font-semibold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {user?.role === 'admin' && pendingSales.map((car) => (
                      <button
                        key={car._id}
                        type="button"
                        onClick={() => { navigate(`/inventory/${car._id}`); setShowNotifications(false); }}
                        className="w-full text-left p-4 border-b border-slate-50 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <ShieldCheck size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-amber-700">Sale approval pending</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {car.brand} {car.model}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}

                    {notifications.map((n) => (
                      <button
                        key={n._id}
                        type="button"
                        onClick={() => {
                          dispatch(markRead(n._id));
                          if (n.link) navigate(n.link);
                          setShowNotifications(false);
                        }}
                        className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                          !n.isRead ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type?.includes('approved') || n.type === 'purchase_sold_success'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-rose-100 text-rose-500'
                          }`}>
                            {n.type?.includes('approved') || n.type === 'purchase_sold_success'
                              ? <CheckCircle size={18} />
                              : <XCircle size={18} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      </button>
                    ))}

                    {notifications.length === 0 && pendingSales.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                          <Bell size={24} className="text-blue-300" />
                        </div>
                        <p className="text-sm text-slate-400">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-7 bg-blue-100 mx-1 hidden sm:block" />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <UserAvatar user={user} size="xs" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
                <p className="text-[11px] text-blue-500 mt-0.5 font-medium">
                  {ROLE_LABELS[user?.role] || user?.role}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-blue-400 hidden md:block transition-transform ${showProfile ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-blue-100 overflow-hidden"
                >
                  <div className="px-4 py-4 bg-gradient-to-br from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="md" className="!ring-white/30" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-blue-100 truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => { navigate('/profile'); setShowProfile(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <User size={16} className="text-blue-500" />
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowProfile(false); setShowLogoutModal(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Sign out" size="sm">
        <div className="p-2 text-center">
          <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Sign out?</h3>
          <p className="text-sm text-slate-500 mt-2 px-4">
            You will need to sign in again to access your dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-semibold border-0"
              onClick={handleLogout}
            >
              Sign out
            </Button>
            <Button
              variant="ghost"
              className="w-full py-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-sm"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
