import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import {
  Car, DollarSign, TrendingUp, ShoppingBag, Wrench, CheckCircle,
  AlertTriangle, Clock, Target,
} from 'lucide-react';
import {
  selectDashboardStats, selectAllCars, calcTotalCost, calcProfit,
  approveSaleThunk, aggregatePurchaseStatsByUser, aggregateSalesStatsByUser,
} from '../store/slices/carSlice';
import {
  PurchaseTeamPanel, SalesTeamPanel, TeamPerformanceSummary,
} from '../components/dashboard/TeamPerformancePanel';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/helper';
import Button from '../components/ui/Button';
import ProfitChart from '../components/charts/ProfitChart';
import ExpenseChart from '../components/charts/ExpenseChart';
import NotificationBanner from '../components/ui/NotificationBanner';
import SaleApprovalModal from '../components/car/SaleApprovalModal';
import DocumentViewerModal from '../components/car/DocumentViewerModal';
import { StatusBadge, ProfitBadge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import {
  DashboardPage, DashboardBanner, BannerStatGrid,
  DashboardSection, CarThumb, EmptyState,
} from '../components/dashboard/DashboardUI';

const PIPELINE_STATS = [
  { key: 'purchased', label: 'Purchased', icon: Car, gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500' },
  { key: 'repair', label: 'In Repair', icon: Wrench, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500' },
  { key: 'ready', label: 'Ready', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500' },
];

function formatCurrency(val) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const cars = useSelector(selectAllCars);
  const navigate = useNavigate();

  const [approvalModal, setApprovalModal] = useState({ isOpen: false, car: null });
  const [viewerDoc, setViewerDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const recentCars = [...cars]
    .sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt))
    .slice(0, 6);

  const lossMakingCars = cars.filter((c) => c.status === 'sold' && calcProfit(c) < 0);
  const pendingSales = cars.filter((c) => c.status === 'sale_pending');

  const pipelineCounts = {
    purchased: cars.filter((c) => c.status === 'purchased').length,
    repair: stats.carsInRepair,
    ready: stats.carsReady,
  };

  const teamPurchaseStats = useMemo(() => aggregatePurchaseStatsByUser(cars), [cars]);
  const teamSalesStats = useMemo(() => aggregateSalesStatsByUser(cars), [cars]);

  const handleApproveAction = async (carId, action) => {
    setLoading(true);
    const res = await dispatch(approveSaleThunk({ carId, action }));
    setLoading(false);
    if (approveSaleThunk.fulfilled.match(res)) {
      toast.success(action === 'approve' ? 'Sale approved!' : 'Sale rejected');
      setApprovalModal({ isOpen: false, car: null });
    } else {
      toast.error(res.payload || 'Action failed');
    }
  };

  return (
    <DashboardPage>
      <DashboardBanner
        eyebrow="Administrator"
        title="Dealership Overview"
        description="Monitor inventory health, approvals, and financial performance."
        gradient="from-blue-600 via-indigo-600 to-violet-600"
        shadow="shadow-blue-500/15"
      >
        <BannerStatGrid
          items={[
            { label: 'Total Cars', value: stats.totalCars, icon: Car, gradient: 'from-sky-300 to-blue-400' },
            { label: 'Investment', value: formatCurrency(stats.totalInvestment), icon: DollarSign, gradient: 'from-amber-300 to-orange-400' },
            { label: 'Sold', value: stats.soldCars, icon: ShoppingBag, gradient: 'from-violet-300 to-purple-400' },
            { label: 'Profit', value: formatCurrency(stats.totalProfit), icon: TrendingUp, gradient: stats.totalProfit >= 0 ? 'from-emerald-300 to-teal-400' : 'from-red-300 to-rose-400' },
          ]}
        />
      </DashboardBanner>

      <AnimatePresence>
        {pendingSales.length > 0 && (
          <NotificationBanner
            id="pending-approvals"
            title="Sale Approvals Required"
            message={pendingSales.length === 1
              ? `"${pendingSales[0].brand} ${pendingSales[0].model}" needs your review`
              : `${pendingSales.length} vehicles awaiting approval`}
            type="warning"
            actionLabel="Review Now"
            onAction={() => {
              document.getElementById('pending-approvals-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onDismiss={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Pipeline chips */}
      <div className="grid grid-cols-3 gap-3">
        {PIPELINE_STATS.map(({ key, label, icon: Icon, bg, gradient }) => (
          <div
            key={key}
            className="relative overflow-hidden bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-sm"
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${bg} flex items-center justify-center shadow-sm shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium truncate">{label}</p>
                <p className="text-slate-900 text-xl sm:text-2xl font-bold leading-tight">{pipelineCounts[key]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team performance — admin analysis */}
      <TeamPerformanceSummary
        purchaseStats={teamPurchaseStats}
        salesStats={teamSalesStats}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <PurchaseTeamPanel stats={teamPurchaseStats} compact mode="team" />
        <SalesTeamPanel stats={teamSalesStats} compact mode="team" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-4">
          {pendingSales.length > 0 && (
            <DashboardSection
              id="pending-approvals-section"
              title="Pending Approvals"
              subtitle="Review and confirm sale requests"
              count={pendingSales.length}
              headerClass="bg-gradient-to-r from-amber-500 to-orange-500 [&_h3]:!text-white [&_p]:!text-orange-100"
              badge={<Clock size={16} className="text-white" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingSales.map((car) => (
                  <div
                    key={car._id}
                    className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 flex flex-col gap-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-amber-100 bg-white">
                        <CarThumb car={car} className="h-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-900 font-semibold text-sm truncate">{car.brand} {car.model}</p>
                        <p className="text-amber-700 text-xs font-bold flex items-center gap-1 mt-0.5">
                          <Target size={11} />
                          ₹{(car.saleApproval?.requestedPrice / 100000).toFixed(2)}L
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/80 rounded-lg p-2">
                        <p className="text-slate-400 text-[10px] uppercase font-medium">Customer</p>
                        <p className="text-slate-800 font-medium truncate">{car.saleApproval?.customerDetails?.name || 'Walk-in'}</p>
                      </div>
                      <div className="bg-white/80 rounded-lg p-2">
                        <p className="text-slate-400 text-[10px] uppercase font-medium">Payment</p>
                        <p className="text-blue-700 font-semibold uppercase truncate">{car.paymentMode || 'Cash'}</p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-amber-600 hover:bg-amber-700 border-none rounded-lg h-8 text-xs"
                      onClick={() => setApprovalModal({ isOpen: true, car })}
                    >
                      Review Request
                    </Button>
                  </div>
                ))}
              </div>
            </DashboardSection>
          )}

          {/* Profit trend — full width */}
          <DashboardSection
            title="Profit Trend"
            subtitle="Revenue vs cost over time"
            headerClass="bg-slate-50"
            headerAccent="from-blue-500 to-indigo-500"
            bodyClassName="p-4 sm:p-6"
          >
            <ProfitChart embedded />
          </DashboardSection>

          {/* Expenses & cost breakdown — full width grid */}
          <DashboardSection
            title="Expenses & Cost Breakdown"
            subtitle="Purchase, expenses & repair spend across entire fleet"
            headerClass="bg-gradient-to-r from-violet-600 to-purple-700 [&_h3]:!text-white [&_p]:!text-violet-100"
            bodyClassName="p-4 sm:p-6"
          >
            <ExpenseChart embedded layout="grid" />
          </DashboardSection>

          <DashboardSection
            title="Recent Inventory"
            subtitle="Latest vehicle additions"
            count={recentCars.length}
            headerClass="bg-gradient-to-r from-blue-50/80 to-indigo-50/80"
            headerAccent="from-blue-500 to-indigo-500"
          >
            {recentCars.length === 0 ? (
              <EmptyState icon={Car} title="No vehicles yet" subtitle="Inventory will appear here once cars are added." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentCars.map((car) => {
                  const totalCost = calcTotalCost(car);
                  const profit = car.status === 'sold' ? calcProfit(car) : null;
                  return (
                    <button
                      key={car._id}
                      type="button"
                      onClick={() => navigate(`/inventory/${car._id}`)}
                      className="flex gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 text-left transition-colors w-full"
                    >
                      <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        {(car.images?.[0] || car.repairImages?.[0]) ? (
                          <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50"><Car size={16} className="text-slate-300" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-800 text-sm font-semibold truncate">{car.brand} {car.model}</p>
                        <p className="text-slate-500 text-[10px] truncate">{car.registrationNumber}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <StatusBadge status={car.status} />
                          {profit !== null && <ProfitBadge profit={profit} />}
                        </div>
                        <p className="text-blue-600 text-xs font-bold mt-1">₹{(totalCost / 100000).toFixed(1)}L</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Loss alert sidebar */}
        <DashboardSection
          title="Loss Alert"
          subtitle="Sold below cost"
          count={lossMakingCars.length}
          headerClass="bg-gradient-to-r from-red-50 to-rose-50"
          headerAccent="from-red-500 to-rose-500"
          badge={<AlertTriangle size={16} className="text-red-500" />}
          className="xl:sticky xl:top-4"
        >
          {lossMakingCars.length === 0 ? (
            <EmptyState icon={CheckCircle} title="All healthy" subtitle="No loss-making vehicles on record." />
          ) : (
            <div className="space-y-2">
              {lossMakingCars.map((car) => (
                <button
                  key={car._id}
                  type="button"
                  onClick={() => navigate(`/inventory/${car._id}`)}
                  className="w-full text-left p-3 bg-red-50 border border-red-100 rounded-xl hover:border-red-200 transition-colors"
                >
                  <p className="text-slate-800 text-sm font-medium truncate">{car.brand} {car.model}</p>
                  <p className="text-red-600 text-xs font-bold mt-1">
                    −₹{Math.abs(calcProfit(car)).toLocaleString('en-IN')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </DashboardSection>
      </div>

      <DocumentViewerModal
        isOpen={!!viewerDoc}
        onClose={() => setViewerDoc(null)}
        documentPath={viewerDoc?.billImage}
        expense={viewerDoc?.expense}
      />
      <SaleApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, car: null })}
        car={approvalModal.car}
        loading={loading}
        onConfirm={(action) => handleApproveAction(approvalModal.car?._id, action)}
        onViewDocument={setViewerDoc}
      />
    </DashboardPage>
  );
}
