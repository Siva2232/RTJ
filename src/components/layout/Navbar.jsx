import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, ChevronDown, Clock, Car, CheckCircle, XCircle, LogOut, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { fetchNotifications, markRead, markAllAsRead } from '../../store/slices/notificationSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const ROLE_LABELS = { admin: 'Administrator', purchase: 'Purchase Team', sales: 'Sales Team' };

export default function Navbar({ title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { list: allCars } = useSelector((s) => s.cars);
  const { list: notifications, unreadCount } = useSelector((s) => s.notifications);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

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

  const pendingSales = allCars.filter(c => c.status === 'sale_pending');
  const hasNotifications = user?.role === 'admin' 
    ? (pendingSales.length > 0 || unreadCount > 0) 
    : unreadCount > 0;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 md:h-18 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shadow-sm"
    >
      {/* Left Side */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-3 -ml-2 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 transition-all"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="text-slate-900 font-black text-xl md:text-2xl tracking-tight truncate">{title}</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium -mt-0.5">
            {ROLE_LABELS[user?.role] || 'Dashboard'}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-2xl transition-all duration-200 ${
              showNotifications 
                ? 'bg-indigo-50 text-indigo-600 shadow-inner' 
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Bell size={20} />
            {hasNotifications && (
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50"
              >
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 tracking-wider">Notifications</h3>
                    <p className="text-xs text-slate-500">Stay updated with your activity</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllAsRead())}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                  {user?.role === 'admin' && pendingSales.map(car => (
                    <div
                      key={car._id}
                      onClick={() => { navigate(`/inventory/${car._id}`); setShowNotifications(false); }}
                      className="p-4 border-b border-slate-100 hover:bg-indigo-50/60 cursor-pointer transition-all group"
                    >
                      <div className="flex gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                          <ShieldCheck size={22} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-amber-700 text-sm">Sale Approval Pending</p>
                          <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                            Review <span className="font-semibold">{car.brand} {car.model}</span> sale request
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(car.saleApproval?.requestedAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={() => {
                        dispatch(markRead(n._id));
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-all ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          n.type?.includes('approved') || n.type === 'purchase_sold_success'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}>
                          {n.type?.includes('approved') || n.type === 'purchase_sold_success' 
                            ? <CheckCircle size={22} /> 
                            : <XCircle size={22} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                          {!n.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />}
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && pendingSales.length === 0 && (
                    <div className="p-12 text-center">
                      <Bell size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-400 font-medium">No new notifications</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-3xl hover:bg-slate-100 transition-all group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>

            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-50"
              >
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.email}</p>
                </div>

                <div className="py-2 px-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                    <User size={18} className="text-slate-400" />
                    My Profile
                  </button>

                  <button
                    onClick={() => { setShowProfile(false); setShowLogoutModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all text-sm font-medium"
                  >
                    <LogOut size={18} className="text-rose-500" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)}
        title="System Logout"
        size="sm"
      >
        <div className="p-4 text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
            <AlertCircle size={36} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Confirm Exit</h3>
          <p className="text-slate-500 text-sm mt-3 font-medium px-6 leading-relaxed">
            You are about to terminate your session. Unsaved changes to inventory reports may be lost.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            <Button 
              variant="primary" 
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-xl" 
              onClick={handleLogout}
            >
              Logout Now
            </Button>
            <Button 
              variant="ghost" 
              className="w-full py-4 rounded-2xl text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest" 
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </motion.header>
  );
}