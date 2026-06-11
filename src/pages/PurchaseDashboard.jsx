import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import {
  Plus, Car, ShoppingCart, TrendingUp,
  Bell, ChevronRight, Wallet,
} from 'lucide-react';
import { selectAllCars, aggregatePurchaseStatsByUser } from '../store/slices/carSlice';
import { PurchaseTeamPanel } from '../components/dashboard/TeamPerformancePanel';
import { markRead, markAllAsRead } from '../store/slices/notificationSlice';
import CarForm from '../components/car/CarForm';
import ExpenseForm from '../components/car/ExpenseForm';
import NotificationBanner from '../components/ui/NotificationBanner';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import {
  DashboardPage, DashboardBanner, BannerStatGrid,
  DashboardSection, CarThumb, VehicleGridCard, EmptyState,
} from '../components/dashboard/DashboardUI';

export default function PurchaseDashboard() {
  const { user } = useSelector((s) => s.auth);
  const allCars = useSelector(selectAllCars);
  const { list: notifications } = useSelector((s) => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCarForm, setShowCarForm] = useState(false);
  const [expenseTarget, setExpenseTarget] = useState(null);

  const myCars = useMemo(() => {
    return allCars.filter((c) => {
      const buyerId = String(c.purchasedBy?._id || c.purchasedBy);
      return buyerId === String(user?._id || user?.id);
    });
  }, [allCars, user]);

  const purchaseNotifications = notifications.filter(
    (n) => !n.isRead && n.type === 'purchase_sold_success'
  );

  const teamPurchaseStats = useMemo(() => aggregatePurchaseStatsByUser(allCars), [allCars]);
  const isAdmin = user?.role === 'admin';

  const displayCars = useMemo(() => (isAdmin ? allCars : myCars), [isAdmin, allCars, myCars]);

  const myPurchaseStats = useMemo(() => {
    const id = String(user?._id || user?.id);
    const found = teamPurchaseStats.find((s) => String(s.id) === id);
    if (found) return found;
    return {
      id,
      name: user?.name || 'You',
      role: user?.role || 'purchase',
      total: myCars.length,
      active: myCars.filter((c) => c.status !== 'sold').length,
      sold: myCars.filter((c) => c.status === 'sold').length,
      investment: myCars.reduce((s, c) => s + (c.purchasePrice || 0), 0),
    };
  }, [teamPurchaseStats, user, myCars]);

  const bannerStats = useMemo(() => {
    const cars = displayCars;
    const totalInv = cars.reduce((s, c) => s + (c.purchasePrice || 0), 0);
    const inPipeline = cars.filter((c) => c.status !== 'sold').length;
    const soldRate = cars.length > 0
      ? `${((cars.filter((c) => c.status === 'sold').length / cars.length) * 100).toFixed(0)}%`
      : '0%';

    return [
      {
        label: isAdmin ? 'Total Purchases' : 'My Purchases',
        value: cars.length,
        icon: Car,
        gradient: 'from-sky-300 to-blue-400',
      },
      { label: 'Pipeline', value: inPipeline, icon: ShoppingCart, gradient: 'from-indigo-300 to-blue-400' },
      { label: 'Investment', value: `₹${(totalInv / 100000).toFixed(1)}L`, icon: Wallet, gradient: 'from-amber-300 to-orange-400' },
      { label: 'Sold Rate', value: soldRate, icon: TrendingUp, gradient: 'from-emerald-300 to-teal-400' },
    ];
  }, [displayCars, isAdmin]);

  return (
    <DashboardPage>
      <DashboardBanner
        eyebrow="Purchase Team"
        title="Purchase Hub"
        description={isAdmin ? 'Full purchase team overview — all sourced vehicles' : `Purchase portfolio for ${user?.name || 'your account'}`}
        gradient="from-amber-600 via-orange-600 to-rose-600"
        shadow="shadow-orange-500/15"
        action={
          <Button
            variant="surface"
            className="rounded-xl text-orange-600 hover:bg-orange-50 h-10 px-5 w-full sm:w-auto font-semibold shrink-0"
            leftIcon={<Plus size={18} className="text-orange-600" />}
            onClick={() => setShowCarForm(true)}
          >
            Add Vehicle
          </Button>
        }
      >
        <BannerStatGrid items={bannerStats} />
      </DashboardBanner>

      <AnimatePresence>
        {purchaseNotifications.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Bell size={14} className="text-emerald-500" />
                Live Sales Feed
              </div>
              <button type="button" onClick={() => dispatch(markAllAsRead())} className="text-xs text-blue-600 hover:text-blue-700">
                Mark all read
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
          </div>
        )}
      </AnimatePresence>

      <PurchaseTeamPanel
        stats={isAdmin ? teamPurchaseStats : [myPurchaseStats]}
        highlightUserId={isAdmin ? undefined : user?._id || user?.id}
        mode={isAdmin ? 'team' : 'personal'}
      />

      <DashboardSection
        title="Acquisition Log"
        subtitle={isAdmin ? 'All vehicles sourced by purchase team' : "Vehicles you've sourced"}
        count={displayCars.length}
        headerClass="bg-gradient-to-r from-blue-50/80 to-indigo-50/80"
        headerAccent="from-blue-500 to-indigo-500"
        badge={
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
            {displayCars.filter((c) => c.status !== 'sold').length} active
          </span>
        }
        className="max-h-[calc(100vh-14rem)]"
        scrollable
      >
        {displayCars.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No purchases yet"
            subtitle={isAdmin ? 'No vehicles have been sourced yet.' : 'Add your first vehicle to start tracking acquisitions.'}
            action={
              <Button variant="primary" className="rounded-xl" leftIcon={<Plus size={16} />} onClick={() => setShowCarForm(true)}>
                Add Vehicle
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayCars.map((car) => {
              const pe = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
              const purchaserName = car.purchasedBy?.name;
              return (
                <VehicleGridCard key={car._id}>
                  <button type="button" className="w-full text-left" onClick={() => navigate(`/inventory/${car._id}`)}>
                    <div className="relative">
                      <CarThumb car={car} className="h-36" />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        <StatusBadge status={car.status} />
                        {isAdmin && purchaserName && (
                          <span className="text-[9px] font-bold bg-slate-900/75 text-white px-2 py-0.5 rounded-md truncate max-w-[120px]">
                            {purchaserName}
                          </span>
                        )}
                      </div>
                      {car.status === 'sold' && (
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                          <ShoppingCart size={10} />
                          ₹{(car.sellingPrice / 100000).toFixed(2)}L
                        </div>
                      )}
                    </div>
                  </button>
                  <div className="p-3 border-t border-slate-100 space-y-3">
                    <div>
                      <p className="text-slate-900 font-semibold text-sm truncate">{car.brand} {car.model}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 truncate">{car.registrationNumber} · {car.ownerType} Owner</p>
                      {car.paymentMode && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                          {car.paymentMode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Buy</p>
                        <p className="text-slate-900 font-bold text-sm">₹{(car.purchasePrice / 100000).toFixed(2)}L</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Procurement</p>
                        <p className="text-blue-600 font-bold text-sm">+₹{(pe / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {car.status !== 'sold' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-lg text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 h-8"
                          leftIcon={<Plus size={13} />}
                          onClick={() => setExpenseTarget(car._id)}
                        >
                          Expense
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/inventory/${car._id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shrink-0"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </VehicleGridCard>
              );
            })}
          </div>
        )}
      </DashboardSection>

      <CarForm isOpen={showCarForm} onClose={() => setShowCarForm(false)} />
      <ExpenseForm isOpen={!!expenseTarget} onClose={() => setExpenseTarget(null)} carId={expenseTarget} type="purchase" />
    </DashboardPage>
  );
}
