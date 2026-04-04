import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Car, ShoppingCart, Receipt, TrendingUp, 
  Bell, ChevronRight, Wallet, History 
} from 'lucide-react';
import { selectAllCars, calcTotalCost, fetchCars } from '../store/slices/carSlice';
import { fetchNotifications, markRead, markAllAsRead } from '../store/slices/notificationSlice';
import CarForm from '../components/car/CarForm';
import ExpenseForm from '../components/car/ExpenseForm';
import NotificationBanner from '../components/ui/NotificationBanner';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/helper';

export default function PurchaseDashboard() {
  const { user } = useSelector((s) => s.auth);
  const allCars = useSelector(selectAllCars);
  const { list: notifications } = useSelector((s) => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCarForm, setShowCarForm] = useState(false);
  const [expenseTarget, setExpenseTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchCars());
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const myCars = useMemo(() => {
    return allCars.filter((c) => {
      const buyerId = String(c.purchasedBy?._id || c.purchasedBy);
      return buyerId === String(user?._id || user?.id);
    });
  }, [allCars, user]);

  const purchaseNotifications = notifications.filter(
    (n) => !n.isRead && n.type === 'purchase_sold_success'
  );

  const stats = useMemo(() => {
    const totalInv = myCars.reduce((s, c) => s + (c.purchasePrice || 0), 0);
    const totalExp = myCars.reduce((s, c) => 
      s + (c.purchaseExpenses || []).reduce((a, e) => a + (e.amount || 0), 0), 0
    );
    const inPipeline = myCars.filter(c => c.status !== 'sold').length;
    
    return [
      { label: 'Active Pipeline', value: inPipeline, sub: 'Units in stock', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Sourcing Value', value: `₹${(totalInv / 100000).toFixed(2)}L`, sub: 'Direct investment', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Procurement Exp', value: `₹${(totalExp / 1000).toFixed(1)}K`, sub: 'Transport & Fees', icon: Receipt, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Success Rate', value: `${myCars.length > 0 ? ((myCars.filter(c => c.status === 'sold').length / myCars.length) * 100).toFixed(0) : 0}%`, sub: 'Inventory turn', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];
  }, [myCars]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight">Purchase Hub</h2>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Tracking sourcing performance for <span className="text-slate-900">{user?.name}</span>
          </p>
        </div>
        <Button
          variant="primary"
          className="rounded-2xl shadow-lg shadow-blue-900/10 h-11 md:h-12 px-5 md:px-6 w-full sm:w-auto"
          leftIcon={<Plus size={18} />}
          onClick={() => setShowCarForm(true)}
        >
          Add New Vehicle
        </Button>
      </div>

      {/* Notifications Alert */}
      <AnimatePresence>
        {purchaseNotifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Bell size={12} className="text-blue-500 animate-pulse" />
                Live Sales Feed
              </div>
              <button 
                onClick={() => dispatch(markAllAsRead())}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
              >
                Mark all as cleared
              </button>
            </div>
            {purchaseNotifications.slice(0, 2).map((n) => (
              <NotificationBanner
                key={n._id}
                id={n._id}
                title="Inventory Sold"
                message={n.message}
                type="success"
                onDismiss={(id) => dispatch(markRead(id))}
                actionLabel="Details"
                onAction={n.relatedCar ? () => navigate(`/inventory/${n.relatedCar}`) : null}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform`} />
            <div className="relative z-10">
              <div className={`w-11 h-11 md:w-12 md:h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-4`}>
                <s.icon size={22} className={s.color} />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <p className="text-slate-900 text-xl md:text-2xl font-black mt-1">{s.value}</p>
              <p className="text-slate-400 text-[10px] font-medium mt-1 uppercase">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
              <History size={18} className="text-slate-600" />
            </div>
            <h3 className="text-slate-900 font-black text-lg">Acquisition Log</h3>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase bg-white px-3 py-1.5 rounded-full border border-slate-100">
            {myCars.length} Total Units
          </span>
        </div>

        {myCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-24">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Car size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-900 font-bold">No active purchases</p>
            <p className="text-slate-400 text-sm">Start by adding a vehicle to your portfolio.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {myCars.map((car) => {
              const pe = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
              return (
                <div 
                  key={car._id} 
                  className="group flex flex-col md:flex-row md:items-center gap-5 md:gap-6 px-5 md:px-8 py-5 hover:bg-blue-50/30 transition-all"
                >
                  {/* Vehicle Thumbnail */}
                  <div 
                    className="w-24 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm cursor-pointer"
                    onClick={() => navigate(`/inventory/${car._id}`)}
                  >
                    {(car.images?.[0] || car.repairImages?.[0]) ? (
                      <img 
                        src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car size={20} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-900 font-black truncate">{car.brand} <span className="font-medium text-slate-500">{car.model}</span></p>
                      <StatusBadge status={car.status} className="scale-75 origin-left" />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      <span>{car.registrationNumber}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span>{car.ownerType} Owner</span>
                    </div>
                    {car.status === 'sold' && (
                      <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        <ShoppingCart size={10} /> Sold for ₹{(car.sellingPrice / 100000).toFixed(2)}L
                      </div>
                    )}
                  </div>

                  {/* Financials */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4 md:gap-12 w-full md:w-auto">
                    <div className="text-left md:text-right">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Buy Price</p>
                      <p className="text-slate-900 font-black text-sm">₹{(car.purchasePrice / 100000).toFixed(2)}L</p>
                    </div>
                    <div className="text-left md:text-right hidden sm:block">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Procurement</p>
                      <p className="text-blue-600 font-black text-sm">+₹{(pe / 1000).toFixed(1)}K</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-auto mt-3 md:mt-0">
                    {car.status !== 'sold' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-xl text-xs font-black border-slate-200 hover:border-blue-200"
                        leftIcon={<Plus size={14} />}
                        onClick={() => setExpenseTarget(car._id)}
                      >
                        EXPENSE
                      </Button>
                    )}
                    <button 
                      onClick={() => navigate(`/inventory/${car._id}`)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CarForm isOpen={showCarForm} onClose={() => setShowCarForm(false)} />
      <ExpenseForm
        isOpen={!!expenseTarget}
        onClose={() => setExpenseTarget(null)}
        carId={expenseTarget}
        type="purchase"
      />
    </div>
  );
}