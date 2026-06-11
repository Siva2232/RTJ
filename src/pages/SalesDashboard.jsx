import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import {
  Car, CheckCircle, DollarSign, ChevronRight,
  Eye, Clock, Bell, TrendingUp,
} from 'lucide-react';
import { selectAllCars, calcTotalCost, updateStatusThunk, aggregateSalesStatsByUser } from '../store/slices/carSlice';
import { SalesTeamPanel } from '../components/dashboard/TeamPerformancePanel';
import { markRead, markAllAsRead } from '../store/slices/notificationSlice';
import ExpenseForm from '../components/car/ExpenseForm';
import SellCarForm from '../components/car/SellCarForm';
import MarkReadyForm from '../components/car/MarkReadyForm';
import CarForm from '../components/car/CarForm';
import NotificationBanner from '../components/ui/NotificationBanner';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  DashboardPage, DashboardBanner, BannerStatGrid,
  DashboardSection, CarThumb, VehicleGridCard, EmptyState,
} from '../components/dashboard/DashboardUI';

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

  const saleNotifications = notifications.filter(
    (n) => !n.isRead && (n.type === 'sale_approved' || n.type === 'sale_rejected')
  );

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

  const teamSalesStats = useMemo(() => aggregateSalesStatsByUser(allCars), [allCars]);
  const mySalesStats = useMemo(() => {
    const id = String(user?._id || user?.id);
    return teamSalesStats.find((s) => String(s.id) === id) || {
      id,
      name: user?.name || 'You',
      role: user?.role || 'sales',
      sold: 0,
      pending: 0,
      revenue: 0,
      profit: 0,
    };
  }, [teamSalesStats, user]);

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

  const renderPipelineAction = (car) => {
    if (car.status === 'purchased') {
      return (
        <Button variant="secondary" size="sm" className="w-full text-xs h-8 rounded-lg" onClick={() => handleStatusAdvance(car)}>
          Move to Repair
        </Button>
      );
    }
    if (car.status === 'repair') {
      return (
        <Button variant="secondary" size="sm" className="w-full text-xs h-8 rounded-lg" onClick={() => setMarkReadyTarget(car)}>
          Mark Ready
        </Button>
      );
    }
    if (car.status === 'ready') {
      return (
        <Button variant="primary" size="sm" className="w-full text-xs h-8 rounded-lg" leftIcon={<DollarSign size={12} />} onClick={() => setSellTarget(car)}>
          Sell Car
        </Button>
      );
    }
    return null;
  };

  return (
    <DashboardPage>
      <DashboardBanner
        eyebrow="Sales Team"
        title="Pipeline & Sales"
        description="Move vehicles through stages and close deals efficiently."
        gradient="from-emerald-600 via-teal-600 to-cyan-600"
        shadow="shadow-emerald-500/15"
      >
        <BannerStatGrid
          items={[
            { label: 'My Sales', value: mySalesStats.sold, icon: DollarSign, gradient: 'from-violet-300 to-purple-400' },
            { label: 'Active', value: activeCars.length, icon: Car, gradient: 'from-sky-300 to-blue-400' },
            { label: 'Ready', value: activeCars.filter((c) => c.status === 'ready').length, icon: CheckCircle, gradient: 'from-emerald-300 to-teal-400' },
            { label: 'My Revenue', value: `₹${(mySalesStats.revenue / 100000).toFixed(1)}L`, icon: TrendingUp, gradient: 'from-emerald-300 to-teal-400' },
          ]}
        />
      </DashboardBanner>

      <AnimatePresence>
        {saleNotifications.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Bell size={14} className="text-blue-500" />
                Updates ({saleNotifications.length})
              </div>
              <button type="button" onClick={() => dispatch(markAllAsRead())} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                Dismiss all
              </button>
            </div>
            {saleNotifications.slice(0, 2).map((n) => (
              <NotificationBanner
                key={n._id}
                id={n._id}
                title={n.type === 'sale_approved' ? 'Sale Approved!' : 'Sale Rejected'}
                message={n.message}
                type={n.type === 'sale_approved' ? 'success' : 'error'}
                onDismiss={(id) => dispatch(markRead(id))}
                actionLabel={n.relatedCar ? 'View' : null}
                onAction={n.relatedCar ? () => { navigate(`/inventory/${n.relatedCar}`); dispatch(markRead(n._id)); } : null}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <SalesTeamPanel
        stats={[mySalesStats]}
        highlightUserId={user?._id || user?.id}
        mode="personal"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <DashboardSection
          title="Active Pipeline"
          subtitle="Move cars through stages to sell"
          count={activeCars.length}
          headerClass="bg-gradient-to-r from-blue-50/80 to-indigo-50/80"
          headerAccent="from-blue-500 to-indigo-500"
          className="xl:col-span-2 max-h-[calc(100vh-13rem)]"
          scrollable
        >
          {activeCars.length === 0 ? (
            <EmptyState icon={CheckCircle} title="All caught up" subtitle="No active cars in the pipeline right now." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCars.map((car) => {
                const totalCost = calcTotalCost(car);
                return (
                  <VehicleGridCard key={car._id} className="!bg-slate-50/40">
                    <div className="relative cursor-pointer" onClick={() => navigate(`/inventory/${car._id}`)}>
                      <CarThumb car={car} className="h-32" imgClassName="group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={car.status} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/inventory/${car._id}`); }}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/95 text-slate-500 hover:text-blue-600 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                    <div className="p-3 space-y-2.5 border-t border-slate-100 bg-white">
                      <div>
                        <p className="text-slate-900 font-semibold text-sm truncate">{car.brand} {car.model}</p>
                        <p className="text-slate-500 text-[11px] truncate mt-0.5">{car.registrationNumber}</p>
                        <p className="text-blue-600 text-xs font-bold mt-1">₹{(totalCost / 100000).toFixed(1)}L invested</p>
                      </div>
                      {renderPipelineAction(car)}
                    </div>
                  </VehicleGridCard>
                );
              })}
            </div>
          )}
        </DashboardSection>

        <div className="space-y-4 xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto">
          <DashboardSection
            title="Awaiting Approval"
            subtitle="Pending admin confirmation"
            count={pendingSales.length}
            headerClass="bg-gradient-to-r from-orange-500 to-amber-500 [&_h3]:!text-white [&_p]:!text-orange-100"
            badge={pendingSales.length > 0 && <Clock size={16} className="text-white animate-pulse" />}
          >
            {pendingSales.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No pending approvals</p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {pendingSales.map((car) => (
                  <button
                    key={car._id}
                    type="button"
                    onClick={() => navigate(`/inventory/${car._id}`)}
                    className="flex gap-3 p-3 rounded-xl border border-orange-100 bg-orange-50/60 hover:bg-orange-50 text-left transition-colors w-full"
                  >
                    <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-orange-100">
                      <CarThumb car={car} className="h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800 text-sm font-semibold truncate">{car.brand} {car.model}</p>
                      <p className="text-orange-600 font-bold text-xs mt-0.5">
                        ₹{(car.saleApproval?.amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-orange-400 shrink-0 self-center" />
                  </button>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Sales Record"
            subtitle="Completed sales"
            count={allSoldCars.length}
            headerClass="bg-gradient-to-r from-violet-50/80 to-purple-50/80"
            headerAccent="from-violet-500 to-purple-500"
            badge={
              <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                {allSoldCars.length} sold
              </span>
            }
          >
            {allSoldCars.length === 0 ? (
              <EmptyState icon={DollarSign} title="No sales yet" subtitle="Sold vehicles will appear here." />
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {allSoldCars.map((car) => {
                  const cost = calcTotalCost(car);
                  const profit = car.sellingPrice - cost;
                  return (
                    <button
                      key={car._id}
                      type="button"
                      onClick={() => navigate(`/inventory/${car._id}`)}
                      className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 text-left transition-colors w-full"
                    >
                      <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        <CarThumb car={car} className="h-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-800 text-sm font-semibold truncate">{car.brand} {car.model}</p>
                        <p className="text-slate-500 text-[10px] truncate">{car.customerDetails?.name || '—'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-900 font-bold text-xs">₹{((car.sellingPrice || 0) / 100000).toFixed(2)}L</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}₹{(profit / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-violet-300 shrink-0 self-center" />
                    </button>
                  );
                })}
              </div>
            )}
          </DashboardSection>
        </div>
      </div>

      <CarForm isOpen={showCarForm} onClose={() => setShowCarForm(false)} />
      <ExpenseForm isOpen={!!expenseTarget} onClose={() => setExpenseTarget(null)} carId={expenseTarget} type="repair" />
      <SellCarForm isOpen={!!sellTarget} onClose={() => setSellTarget(null)} car={sellTarget} />
      <MarkReadyForm isOpen={!!markReadyTarget} onClose={() => setMarkReadyTarget(null)} car={markReadyTarget} />
    </DashboardPage>
  );
}
