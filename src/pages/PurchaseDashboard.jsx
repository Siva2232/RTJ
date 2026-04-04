import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Car, ShoppingCart, Receipt, TrendingUp, Bell, X, CheckCircle2 } from 'lucide-react';
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

    // Polling for real-time notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const isPurchaseStaff = user?.role === 'purchase' || user?.role === 'sales'; // Adjust roles as needed

  const myCars = allCars.filter((c) => {
    const buyerId = String(c.purchasedBy?._id || c.purchasedBy);
    return buyerId === String(user?._id || user?.id);
  });

  // Unread "sold" notifications for this purchase user
  const purchaseNotifications = notifications.filter(
    (n) => !n.isRead && n.type === 'purchase_sold_success'
  );

  const handleDismissNotification = (id) => {
    dispatch(markRead(id));
  };

  const handleDismissAll = () => {
    dispatch(markAllAsRead());
  };

  const totalInvestment = myCars.reduce((s, c) => s + (c.purchasePrice || 0), 0);
  const totalPurchaseExp = myCars.reduce(
    (s, c) => s + (c.purchaseExpenses || []).reduce((a, e) => a + (e.amount || 0), 0),
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-2xl font-bold">Purchase Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage vehicle purchases for {user?.name}</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCarForm(true)}
        >
          Add New Car
        </Button>
      </div>

      {/* ── Sale Notification Banners for Purchase Staff ── */}
      <AnimatePresence>
        {purchaseNotifications.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <Bell size={12} className="text-emerald-500" />
                Sales Updates ({purchaseNotifications.length})
              </div>
              <button 
                onClick={handleDismissAll}
                className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-red-500 transition-colors"
              >
                Dismiss All
              </button>
            </div>
            {purchaseNotifications.slice(0, 3).map((n) => (
              <NotificationBanner
                key={n._id}
                id={n._id}
                title="Stock Sold!"
                message={n.message}
                type="success"
                onDismiss={handleDismissNotification}
                actionLabel={n.relatedCar ? "View Car Details" : null}
                onAction={n.relatedCar ? () => { navigate(`/inventory/${n.relatedCar}`); handleDismissNotification(n._id); } : null}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cars Added', value: myCars.length, icon: Car, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Total Investment', value: `₹${(totalInvestment / 100000).toFixed(1)}L`, icon: TrendingUp, bg: 'bg-amber-50', text: 'text-amber-600' },
          { label: 'Purchase Expenses', value: `₹${totalPurchaseExp.toLocaleString('en-IN')}`, icon: Receipt, bg: 'bg-violet-50', text: 'text-violet-600' },
          { label: 'Cars In Pipeline', value: myCars.filter((c) => c.status !== 'sold').length, icon: ShoppingCart, bg: 'bg-emerald-50', text: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">{label}</p>
                <p className="text-slate-900 font-bold text-xl">{value}</p>
              </div>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={text} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Cars Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-900 font-semibold">Cars I Purchased ({myCars.length})</h3>
        </div>

        {myCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Car size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No cars added yet</p>
            <p className="text-slate-400 text-sm mt-1">Click "Add New Car" to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {myCars.map((car) => {
              const totalCost = calcTotalCost(car);
              const pe = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
              return (
                <div
                  key={car._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Car Image */}
                  <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {(car.images?.[0] || car.repairImages?.[0]) ? (
                      <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car size={16} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Car Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/inventory/${car._id}`)}
                  >
                    <p className="text-slate-800 text-sm font-semibold truncate">
                      {car.brand} {car.model} ({car.year})
                    </p>
                    <p className="text-slate-500 text-xs">{car.registrationNumber} · {car.ownerType} Owner</p>
                    {car.status === 'sold' && (
                      <p className="text-emerald-600 text-[10px] font-bold uppercase mt-1">Sold for ₹{(car.sellingPrice / 100000).toFixed(2)}L</p>
                    )}
                  </div>

                  {/* Status */}
                  <StatusBadge status={car.status} />

                  {/* Prices */}
                  <div className="text-right hidden lg:block min-w-[150px]">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Purchase + Exp</p>
                    <p className="text-slate-800 text-sm font-semibold">
                      ₹{car.purchasePrice.toLocaleString('en-IN')} + ₹{pe.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/inventory/${car._id}`)}
                    >
                      Details
                    </Button>
                    {car.status !== 'sold' && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Plus size={13} />}
                        onClick={() => setExpenseTarget(car._id)}
                      >
                        Expense
                      </Button>
                    )}
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
