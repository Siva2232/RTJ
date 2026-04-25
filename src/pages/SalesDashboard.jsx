import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Wrench, CheckCircle, DollarSign, Plus, ChevronRight, Eye, ShieldAlert, Clock, Bell, X, CheckCircle2, XCircle } from 'lucide-react';
import { selectAllCars, calcTotalCost, updateStatusThunk, fetchCars } from '../store/slices/carSlice';
import { fetchNotifications, markRead, markAllAsRead } from '../store/slices/notificationSlice';
import ExpenseForm from '../components/car/ExpenseForm';
import SellCarForm from '../components/car/SellCarForm';
import MarkReadyForm from '../components/car/MarkReadyForm';
import CarForm from '../components/car/CarForm';
import NotificationBanner from '../components/ui/NotificationBanner';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getImageUrl } from '../utils/helper';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_FLOW = { purchased: 'repair', repair: 'ready' };

export default function SalesDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const allCars = useSelector(selectAllCars);
  const { list: notifications } = useSelector((s) => s.notifications);

  const [expenseTarget, setExpenseTarget] = useState(null);
  const [sellTarget, setSellTarget] = useState(null);
  const [markReadyTarget, setMarkReadyTarget] = useState(null);
  const [showCarForm, setShowCarForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCars());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const saleNotifications = notifications.filter(
    (n) => !n.isRead && (n.type === 'sale_approved' || n.type === 'sale_rejected')
  );

  const handleDismissNotification = (id) => {
    dispatch(markRead(id));
  };

  const handleDismissAll = () => {
    dispatch(markAllAsRead());
  };

  const isSales = user?.role === 'sales';

  const filterByUser = (cars) => {
    if (!isSales) return cars;
    return cars.filter((c) => 
      c.soldBy?._id === user?._id || 
      c.soldBy === user?._id ||
      c.saleApproval?.requestedBy?._id === user?._id ||
      c.saleApproval?.requestedBy === user?._id
    );
  };

  const activeCars = allCars.filter((c) => c.status !== 'sold' && c.status !== 'sale_pending');
  
  const pendingSales = filterByUser(allCars.filter((c) => c.status === 'sale_pending'));
  const allSoldCars = filterByUser(allCars.filter((c) => c.status === 'sold'))
    .sort((a, b) => new Date(b.soldDate) - new Date(a.soldDate));

  const totalSoldRevenue = allSoldCars.reduce((s, c) => s + (c.sellingPrice || 0), 0);
  const totalRepairExp = activeCars.reduce(
    (s, c) => s + (c.repairCosts || []).reduce((a, e) => a + (e.amount || 0), 0),
    0
  );

  const handleStatusAdvance = async (car) => {
    const next = STATUS_FLOW[car.status];
    if (!next) return;
    const result = await dispatch(updateStatusThunk({ carId: car._id, status: next }));
    if (updateStatusThunk.fulfilled.match(result)) {
      toast.success(`${car.brand} ${car.model} moved to "${next}"`);
    } else {
      toast.error(result.payload || 'Failed to update status');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight">Sales Dashboard</h2>
          <p className="text-slate-500 text-sm md:text-base mt-0.5">
            Manage inventory pipeline, record repairs, and close vehicle sales
          </p>
        </div>
        <Button
          variant="primary"
          className="rounded-2xl shadow-lg shadow-blue-900/10 h-11 md:h-12 px-5 md:px-6 w-full sm:w-auto"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCarForm(true)}
        >
          Add New Car
        </Button>
      </div>

      {/* Sale Notification Banners */}
      <AnimatePresence>
        {saleNotifications.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <Bell size={12} className="text-blue-500" />
                Recent Updates ({saleNotifications.length})
              </div>
              <button 
                onClick={handleDismissAll}
                className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-red-500 transition-colors"
              >
                Dismiss All
              </button>
            </div>
            {saleNotifications.slice(0, 3).map((n) => (
              <NotificationBanner
                key={n._id}
                id={n._id}
                title={n.type === 'sale_approved' ? 'Sale Approved!' : 'Sale Rejected'}
                message={n.message}
                type={n.type === 'sale_approved' ? 'success' : 'error'}
                onDismiss={handleDismissNotification}
                actionLabel={n.relatedCar ? "View Car Details" : null}
                onAction={n.relatedCar ? () => { navigate(`/inventory/${n.relatedCar}`); handleDismissNotification(n._id); } : null}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Active Cars', value: activeCars.length, icon: Car, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Ready to Sell', value: activeCars.filter(c => c.status === 'ready').length, icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Repair Expenses', value: `₹${(totalRepairExp / 1000).toFixed(0)}K`, icon: Wrench, bg: 'bg-amber-50', text: 'text-amber-600' },
          { label: 'Total Revenue', value: `₹${(totalSoldRevenue / 100000).toFixed(1)}L`, icon: DollarSign, bg: 'bg-violet-50', text: 'text-violet-600' },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-xs mb-1">{label}</p>
                <p className="text-slate-900 font-bold text-xl md:text-2xl">{value}</p>
              </div>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={text} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Cars Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-900 font-semibold">Active Pipeline ({activeCars.length})</h3>
          <p className="text-slate-500 text-xs mt-0.5">Move cars through stages to sell</p>
        </div>

        {activeCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3 mx-auto">
              <CheckCircle size={24} />
            </div>
            <p className="text-slate-500 font-medium">All active cars managed!</p>
            <p className="text-slate-400 text-xs mt-1">Check pending approvals or the sales record</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activeCars.map((car) => {
              const totalCost = calcTotalCost(car);
              return (
                <div key={car._id} className="flex flex-col md:flex-row md:items-center gap-4 px-5 md:px-6 py-5 hover:bg-slate-50 transition-colors">
                  {/* Image + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {(car.images?.[0] || car.repairImages?.[0]) ? (
                        <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car size={16} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/inventory/${car._id}`)}>
                      <p className="text-slate-800 text-sm font-semibold truncate">{car.brand} {car.model}</p>
                      <p className="text-slate-500 text-xs">{car.registrationNumber} · ₹{(totalCost / 100000).toFixed(1)}L total cost</p>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <StatusBadge status={car.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye size={13} />}
                      onClick={() => navigate(`/inventory/${car._id}`)}
                    >
                      View
                    </Button>

                    {/* {car.status === 'repair' && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Plus size={13} />}
                        onClick={() => setExpenseTarget(car._id)}
                      >
                        Repair Cost
                      </Button>
                    )} */}

                    {car.status === 'purchased' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ChevronRight size={13} />}
                        onClick={() => handleStatusAdvance(car)}
                      >
                        Move to Repair
                      </Button>
                    )}

                    {car.status === 'repair' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ChevronRight size={13} />}
                        onClick={() => setMarkReadyTarget(car)}
                      >
                        Mark Ready
                      </Button>
                    )}

                    {car.status === 'ready' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<DollarSign size={13} />}
                        onClick={() => setSellTarget(car)}
                      >
                        Sell Car
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Approvals */}
      {pendingSales.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="px-5 md:px-6 py-4 border-b border-orange-100 bg-orange-50/50">
            <h3 className="text-orange-900 font-semibold flex items-center gap-2">
              <Clock size={16} className="text-orange-500 animate-pulse" />
              Awaiting Admin Approval ({pendingSales.length})
            </h3>
            <p className="text-orange-700 text-xs mt-0.5">These cars are sold but pending admin confirmation</p>
          </div>
          <div className="divide-y divide-orange-50">
            {pendingSales.map((car) => (
              <div key={car._id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 md:px-6 py-4 hover:bg-orange-50/30 transition-colors">
                <div className="w-12 h-9 rounded bg-white overflow-hidden shadow-sm flex-shrink-0">
                  {car.images?.[0] ? (
                    <img src={getImageUrl(car.images[0])} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                      <Car size={14} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-semibold">{car.brand} {car.model}</p>
                  <p className="text-orange-600 font-bold text-xs">₹{(car.saleApproval?.amount || 0).toLocaleString('en-IN')} pending</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Submitted By</p>
                  <p className="text-slate-700 text-xs font-medium">{car.saleApproval?.requestedBy?.name || 'Sales Staff'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Record */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 md:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-slate-900 font-semibold">Sales Record</h3>
            <p className="text-slate-500 text-xs mt-0.5">All sold cars tracked by staff member</p>
          </div>
          <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full w-fit">
            {allSoldCars.length} sold
          </span>
        </div>

        {allSoldCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <DollarSign size={36} className="text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">No cars sold yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {allSoldCars.map((car) => {
              const cost = calcTotalCost(car);
              const profit = car.sellingPrice - cost;
              return (
                <div
                  key={car._id}
                  onClick={() => navigate(`/inventory/${car._id}`)}
                  className="flex flex-col md:flex-row md:items-center gap-4 px-5 md:px-6 py-5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {(car.images?.[0] || car.repairImages?.[0]) ? (
                        <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car size={16} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-semibold truncate">
                        {car.brand} {car.model} ({car.year})
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        <span className="font-medium text-slate-600">{car.customerDetails?.name || '—'}</span>
                        {car.customerDetails?.phone && ` · ${car.customerDetails.phone}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end text-left md:text-right">
                    <p className="text-slate-800 font-bold text-sm">₹{((car.sellingPrice || 0) / 100000).toFixed(2)}L</p>
                    <p className={`text-xs font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {profit >= 0 ? '+' : ''}₹{(profit / 1000).toFixed(0)}K
                    </p>
                    <p className="text-slate-400 text-xs">{car.registrationNumber}</p>
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
        type="repair"
      />
      <SellCarForm
        isOpen={!!sellTarget}
        onClose={() => setSellTarget(null)}
        car={sellTarget}
      />
      <MarkReadyForm
        isOpen={!!markReadyTarget}
        onClose={() => setMarkReadyTarget(null)}
        car={markReadyTarget}
      />
    </div>
  );
}