import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Bell, ChevronDown, CheckCircle, XCircle, LogOut, 
  User, ShieldCheck, AlertCircle, Sparkles, Inbox
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { fetchNotifications, markRead, markAllAsRead } from '../../store/slices/notificationSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const ROLE_LABELS = { admin: 'Systems Admin', purchase: 'Procurement Specialist', sales: 'Account Executive' };

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
    toast.success('Securely logged out');
    navigate('/login');
  };

  const pendingSales = allCars.filter(c => c.status === 'sale_pending');
  const hasNotifications = user?.role === 'admin' ? (pendingSales.length > 0 || unreadCount > 0) : unreadCount > 0;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-[40]"
    >
      <div className="flex items-center gap-6">
        {/* <button
          onClick={() => dispatch(toggleSidebar())}
          className="group relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 transition-all active:scale-95"
        >
          <Menu size={20} />
          <div className="absolute inset-0 rounded-xl ring-2 ring-indigo-500/0 group-hover:ring-indigo-500/10 transition-all" />
        </button> */}
        
        <div className="hidden sm:block h-8 w-px bg-slate-200/80" />

        <div className="flex flex-col">
          <h1 className="text-slate-900 font-black text-xl tracking-tight leading-none">{title}</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{ROLE_LABELS[user?.role] || 'Authenticated User'}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`group relative p-3 rounded-2xl transition-all duration-300 ${
              showNotifications ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell size={20} className={showNotifications ? 'animate-pulse' : ''} />
            {hasNotifications && (
              <span className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white ${showNotifications ? 'bg-white' : 'bg-rose-500'}`} />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-4 w-96 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/50 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.15em]">Notification Center</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => dispatch(markAllAsRead())}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {user?.role === 'admin' && pendingSales.map(car => (
                    <div 
                      key={car._id}
                      onClick={() => { navigate(`/inventory/${car._id}`); setShowNotifications(false); }}
                      className="p-5 border-b border-slate-50 hover:bg-amber-50/30 cursor-pointer transition-all group relative"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100 shadow-sm group-hover:bg-amber-100 group-hover:rotate-3 transition-all">
                          <ShieldCheck size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-100/50 px-2 py-0.5 rounded-md">Critical Approval</span>
                            <span className="text-[9px] font-bold text-slate-400">Now</span>
                          </div>
                          <p className="text-slate-900 font-bold text-sm mt-1">Review sale for {car.brand} {car.model}</p>
                          <p className="text-slate-500 text-xs mt-0.5">Sale request pending authorization by admin.</p>
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
                      className={`p-5 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-all relative ${!n.isRead ? 'bg-indigo-50/20' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-sm transition-transform group-hover:scale-105 ${
                          n.type === 'sale_approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {n.type === 'sale_approved' ? <CheckCircle size={22} /> : <Inbox size={22} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-slate-900 font-black text-xs uppercase tracking-tight">{n.title}</p>
                            {!n.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />}
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed mt-1">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!hasNotifications && notifications.length === 0) && (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Inbox size={28} />
                      </div>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Inbox Zero</p>
                      <p className="text-slate-300 text-[10px] mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 pl-1.5 pr-4 bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all group border border-white/10"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black border border-white/20">
              {user?.name?.[0].toUpperCase()}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-white text-xs font-black uppercase tracking-wide leading-none">{user?.name}</p>
              <p className="text-slate-500 text-[9px] font-bold mt-1 uppercase tracking-tighter">Verified</p>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden py-3"
              >
                <div className="px-6 py-4 border-b border-slate-50 mb-3 bg-slate-50/30">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Session</span>
                  <p className="text-slate-900 text-sm font-black truncate mt-1">{user?.email}</p>
                </div>

                <div className="px-3 space-y-1">
                  <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-wider group">
                    <User size={18} className="text-slate-400 group-hover:text-indigo-600" />
                    Account Settings
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); setShowLogoutModal(true); }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all font-black text-xs uppercase tracking-widest group"
                  >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    Logout System
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="System Logout" size="sm">
        <div className="p-4 text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100">
            <AlertCircle size={36} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Confirm Exit</h3>
          <p className="text-slate-500 text-sm mt-3 font-medium px-6 leading-relaxed">
            You are about to terminate your session. Unsaved changes to inventory reports may be lost.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            <Button variant="primary" className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-xl" onClick={handleLogout}>
              Logout Now
            </Button>
            <Button variant="ghost" className="w-full py-4 rounded-2xl text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </motion.header>
  );
}