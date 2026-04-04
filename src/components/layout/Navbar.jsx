import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, ChevronDown, Clock, Car, ChevronRight, CheckCircle, XCircle, LogOut, User, ShieldCheck, AlertCircle } from 'lucide-react';
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
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
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
  // Admin sees pending items, Sales/Purchase see their notifications
  const hasNotifications = user?.role === 'admin' ? (pendingSales.length > 0 || unreadCount > 0) : unreadCount > 0;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-slate-900 font-semibold text-lg leading-tight">{title}</h1>
          <p className="text-slate-500 text-xs">{ROLE_LABELS[user?.role] || 'User'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all duration-300 ${showNotifications ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell size={19} />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-bounce" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                className="absolute right-0 mt-3 w-85 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-200/50"
              >
                <div className="p-4 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-900 font-black text-sm uppercase tracking-wider">Alerts</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Updates for your attention</p>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => dispatch(markAllAsRead())}
                      className="text-indigo-600 text-[10px] font-black uppercase tracking-tighter hover:text-indigo-700 transition-colors"
                    >
                      Sweep All
                    </button>
                  )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                  {user?.role === 'admin' && pendingSales.map(car => (
                    <div 
                      key={car._id}
                      onClick={() => { navigate(`/inventory/${car._id}`); setShowNotifications(false); }}
                      className="p-4 border-b border-slate-50 hover:bg-indigo-50/40 cursor-pointer transition-all group relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex gap-4">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-amber-100 shadow-sm">
                          <ShieldCheck size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-black text-[11px] uppercase tracking-wide">Approval Queue</p>
                          <p className="text-slate-600 text-xs leading-relaxed mt-0.5 line-clamp-2">
                             Review sale request for <span className="font-bold text-slate-800">{car.brand} {car.model}</span>.
                          </p>
                          <div className="flex items-center justify-between mt-2 font-black uppercase text-[9px] tracking-widest text-slate-400">
                             <span>Pending Release</span>
                             <span className="text-amber-600">{new Date(car.saleApproval.requestedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.map(n => (
                    <div 
                      key={n._id}
                      onClick={() => {
                        dispatch(markRead(n._id));
                        if(n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-all group relative ${!n.isRead ? 'bg-indigo-50/20' : ''}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                      <div className="flex gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border shadow-sm ${
                          n.type === 'sale_approved' || n.type === 'purchase_sold_success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {n.type === 'sale_approved' || n.type === 'purchase_sold_success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-slate-900 font-black text-[11px] uppercase tracking-wide truncate">{n.title}</p>
                            {!n.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!hasNotifications && notifications.length === 0) && (
                    <div className="p-8 text-center bg-white">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <Bell size={24} />
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Inbox Empty</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="group flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 transition-all duration-300 ring-1 ring-transparent hover:ring-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform border-2 border-white">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-slate-900 text-[11px] font-black uppercase tracking-wider leading-none">{user?.name}</p>
              <p className="text-slate-500 text-[9px] font-bold mt-1 uppercase tracking-tighter opacity-80">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2 ring-1 ring-slate-200/50"
              >
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Account Info</p>
                  <p className="text-slate-900 text-sm font-bold truncate">{user?.email}</p>
                </div>

                <div className="space-y-0.5 px-2">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <User size={16} />
                    </div>
                    My Profile
                  </button>
                  
                  <div className="h-px bg-slate-50 my-2 mx-2" />
                  
                  <button
                    onClick={() => { setShowProfile(false); setShowLogoutModal(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all text-xs font-bold uppercase tracking-wider group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
                      <LogOut size={16} />
                    </div>
                    Logout Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Exit"
        size="sm"
      >
        <div className="p-2">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-rose-50/50">
            <AlertCircle size={32} />
          </div>
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Check</h3>
            <p className="text-slate-500 text-sm font-medium px-4">
              Are you sure you want to exit the system? You'll need to re-authenticate to access your dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              variant="primary" 
              className="w-full bg-rose-600 hover:bg-rose-700 shadow-rose-200" 
              onClick={handleLogout}
            >
              Confirm Logout
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-slate-500 font-bold hover:bg-slate-100" 
              onClick={() => setShowLogoutModal(false)}
            >
              Stay Logged In
            </Button>
          </div>
        </div>
      </Modal>
    </motion.header>
  );
}
