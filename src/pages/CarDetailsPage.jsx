import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft, Car, Calendar, Fuel, User, Plus,
  TrendingUp, TrendingDown, DollarSign, Wrench, ShoppingCart,
  ChevronRight, Phone, Target, Gauge, FileText, Palette,
  CreditCard, Hash, ImageIcon,
} from 'lucide-react';
import {
  fetchCarById,
  selectCarById,
  calcTotalCost,
  calcProfit,
  deletePurchaseExpenseThunk,
  deleteRepairCostThunk,
} from '../store/slices/carSlice';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ExpenseForm from '../components/car/ExpenseForm';
import SellCarForm from '../components/car/SellCarForm';
import MarkReadyForm from '../components/car/MarkReadyForm';
import MoveToRepairModal from '../components/car/MoveToRepairModal';
import ExpenseDocumentCard from '../components/car/ExpenseDocumentCard';
import DocumentViewerModal from '../components/car/DocumentViewerModal';
import SaleCustomerDetailsPanel from '../components/car/SaleCustomerDetailsPanel';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/helper';
import {
  DashboardPage, DashboardBanner, BannerStatGrid, DashboardSection, EmptyState,
} from '../components/dashboard/DashboardUI';

const STATUS_FLOW = { purchased: 'repair', repair: 'ready', ready: null };
const NEXT_LABEL = { purchased: 'Move to Repair', repair: 'Mark as Ready' };
const PIPELINE = [
  { key: 'purchased', label: 'Purchased', color: 'bg-blue-500' },
  { key: 'repair', label: 'Repair', color: 'bg-amber-500' },
  { key: 'ready', label: 'Ready', color: 'bg-emerald-500' },
  { key: 'sold', label: 'Sold', color: 'bg-violet-500' },
];

const STATUS_GRADIENT = {
  purchased: 'from-blue-600 via-blue-600 to-indigo-700',
  repair: 'from-amber-500 via-orange-500 to-orange-600',
  ready: 'from-emerald-500 via-teal-500 to-cyan-600',
  sale_pending: 'from-orange-500 via-amber-500 to-yellow-500',
  sold: 'from-violet-600 via-purple-600 to-indigo-700',
};

function StatusPipeline({ status }) {
  const activeIdx = status === 'sale_pending'
    ? PIPELINE.findIndex((s) => s.key === 'ready')
    : PIPELINE.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1 sm:gap-2 w-full overflow-x-auto pb-0.5 scrollbar-none">
      {PIPELINE.map((step, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx || (status === 'sale_pending' && step.key === 'ready');
        const pending = i > activeIdx;
        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div
                className={`w-full h-1.5 rounded-full transition-all ${
                  done ? step.color : active ? step.color : 'bg-white/25'
                } ${active ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-transparent' : ''}`}
              />
              <span
                className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide truncate w-full text-center ${
                  pending ? 'text-white/40' : 'text-white/90'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <ChevronRight size={12} className="text-white/30 shrink-0 hidden sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SpecPill({ icon: Icon, label, value }) {
  if (!value || value === '—') return null;
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white">
      {Icon && <Icon size={12} className="text-white/70 shrink-0" />}
      <span className="text-white/60 font-medium">{label}</span>
      <span className="font-bold capitalize truncate max-w-[100px] sm:max-w-none">{value}</span>
    </span>
  );
}

function InfoRow({ icon: Icon, label, value, accent = 'text-slate-900' }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-bold mt-0.5 truncate ${accent}`}>{value || '—'}</p>
      </div>
    </div>
  );
}

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const car = useSelector(selectCarById(id));

  const [showPurchaseExpForm, setShowPurchaseExpForm] = useState(false);
  const [showRepairExpForm, setShowRepairExpForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showMarkReadyForm, setShowMarkReadyForm] = useState(false);
  const [showMoveToRepairModal, setShowMoveToRepairModal] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    dispatch(fetchCarById(id));
  }, [id, dispatch]);

  if (!car) {
    return (
      <div className="flex items-center justify-center h-[50vh] px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Car size={30} className="text-blue-400 animate-pulse" />
          </div>
          <p className="text-slate-600 text-sm font-semibold">Loading vehicle details...</p>
          <p className="text-slate-400 text-xs mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  const totalCost = calcTotalCost(car);
  const profit = car.status === 'sold' ? calcProfit(car) : null;
  const purchaseExpTotal = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const repairExpTotal = (car.repairCosts || []).reduce((s, e) => s + (e.amount || 0), 0);
  const isProfit = profit !== null && profit >= 0;

  const allImages = [
    ...(car.images || []).map((src) => ({ src, type: 'purchase' })),
    ...(car.repairImages || []).map((src) => ({ src, type: 'repair' })),
  ];
  const galleryImages = allImages.length > 0 ? allImages : [];
  const mainImage = galleryImages[activeImage]?.src;

  const openDocumentViewer = (expense) => {
    if (!expense?.billImage) return;
    setViewerDoc({ billImage: expense.billImage, expense });
  };

  const canAddPurchaseExp = user?.role === 'admin' || user?.role === 'purchase';
  const canAddRepairExp = user?.role === 'admin' || user?.role === 'sales';
  const canSell = (user?.role === 'admin' || user?.role === 'sales') && car.status === 'ready';
  const isSalePending = car.status === 'sale_pending';
  const canAdvanceStatus = (user?.role === 'admin' || user?.role === 'sales') && STATUS_FLOW[car.status];

  const handleStatusAdvance = () => {
    const next = STATUS_FLOW[car.status];
    if (!next) return;
    if (next === 'repair') setShowMoveToRepairModal(true);
    else if (next === 'ready') setShowMarkReadyForm(true);
  };

  const handleDeletePurchaseExpense = async (expenseId) => {
    const result = await dispatch(deletePurchaseExpenseThunk({ carId: car._id, expenseId }));
    if (deletePurchaseExpenseThunk.fulfilled.match(result)) toast.success('Expense removed');
    else toast.error(result.payload || 'Failed to remove expense');
  };

  const handleDeleteRepairCost = async (repairId) => {
    const result = await dispatch(deleteRepairCostThunk({ carId: car._id, repairId }));
    if (deleteRepairCostThunk.fulfilled.match(result)) toast.success('Repair cost removed');
    else toast.error(result.payload || 'Failed to remove repair cost');
  };

  const isAdmin = user?.role === 'admin';
  const purchaserName = car.purchasedBy?.name || 'Unknown';
  const sellerName = car.soldBy?.name;
  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const bannerGradient = STATUS_GRADIENT[car.status] || STATUS_GRADIENT.purchased;

  const bannerStats = [
    { label: 'Purchase Price', value: fmt(car.purchasePrice), icon: ShoppingCart, gradient: 'from-blue-400 to-cyan-400' },
    { label: 'Expenses', value: fmt(purchaseExpTotal), icon: FileText, gradient: 'from-sky-400 to-blue-400' },
    { label: 'Repair Costs', value: fmt(repairExpTotal), icon: Wrench, gradient: 'from-amber-400 to-orange-400' },
    {
      label: car.status === 'sold' ? (isProfit ? 'Net Profit' : 'Net Loss') : 'Total Investment',
      value: car.status === 'sold' ? fmt(Math.abs(profit)) : fmt(totalCost),
      icon: car.status === 'sold' ? (isProfit ? TrendingUp : TrendingDown) : Target,
      gradient: car.status === 'sold' ? (isProfit ? 'from-emerald-400 to-teal-400' : 'from-rose-400 to-red-400') : 'from-violet-400 to-purple-400',
    },
  ];

  return (
    <DashboardPage className="pb-28 lg:pb-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors group"
        >
          <span className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm group-hover:border-blue-200 group-hover:shadow-md transition-all">
            <ArrowLeft size={16} />
          </span>
          <span className="hidden sm:inline">Back to Inventory</span>
        </button>
        <div className="flex items-center gap-2">
          <StatusBadge status={car.status} />
          {car.status !== 'sold' && !isSalePending && (
            <div className="hidden md:flex items-center gap-2">
              {canSell && (
                <Button variant="success" size="sm" leftIcon={<DollarSign size={14} />} onClick={() => setShowSellForm(true)}>
                  Sell Vehicle
                </Button>
              )}
              {canAdvanceStatus && (
                <Button variant="surface" size="sm" rightIcon={<ChevronRight size={14} />} onClick={handleStatusAdvance} className="!text-slate-800">
                  {NEXT_LABEL[car.status]}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hero banner */}
      <DashboardBanner
        eyebrow="Vehicle Details"
        title={`${car.brand} ${car.model}`}
        description={car.registrationNumber}
        gradient={bannerGradient}
        shadow="shadow-indigo-500/25"
        action={
          car.sellingPrice && car.status === 'sold' ? (
            <div className="text-right shrink-0">
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Sold For</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{fmt(car.sellingPrice)}</p>
            </div>
          ) : null
        }
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <SpecPill icon={Hash} label="Reg" value={car.registrationNumber} />
          <SpecPill icon={Calendar} label="Year" value={car.year} />
          <SpecPill icon={Fuel} label="Fuel" value={car.fuelType} />
          <SpecPill icon={Palette} label="Color" value={car.color} />
          <SpecPill icon={Gauge} label="KM" value={car.mileage ? car.mileage.toLocaleString('en-IN') : null} />
          <SpecPill icon={User} label="Owner" value={`${car.ownerType} Owner`} />
        </div>
        <StatusPipeline status={car.status} />
        <div className="mt-4">
          <BannerStatGrid items={bannerStats} />
        </div>
      </DashboardBanner>

      {/* Gallery + sidebar info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Image gallery */}
        <div className="lg:col-span-7">
          <DashboardSection
            title="Photos"
            subtitle={`${galleryImages.length} image${galleryImages.length !== 1 ? 's' : ''}`}
            headerAccent="from-blue-500 to-indigo-500"
            className="h-full"
          >
            {galleryImages.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="No photos uploaded"
                subtitle="Vehicle images will appear here once added"
              />
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[16/10] sm:aspect-[16/9]">
                  <img
                    src={getImageUrl(mainImage)}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  {galleryImages[activeImage]?.type === 'repair' && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg shadow-lg">
                      Repair Photo
                    </span>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {galleryImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === i ? 'border-blue-500 shadow-md shadow-blue-500/20 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={getImageUrl(img.src)} alt="" className="w-full h-full object-cover" />
                        {img.type === 'repair' && (
                          <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[7px] font-bold text-center py-0.5">RPR</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Payment + team */}
        <div className="lg:col-span-5 space-y-4">
          <DashboardSection title="Payment Details" subtitle="Transaction record" headerAccent="from-emerald-500 to-teal-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoRow icon={CreditCard} label="Method" value={(car.paymentMode || 'Cash').toUpperCase()} />
              <InfoRow icon={Hash} label="UTR Number" value={car.utrNumber} />
              <InfoRow
                icon={Calendar}
                label="Payment Date"
                value={
                  car.paymentDate
                    ? new Date(car.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : null
                }
              />
              <InfoRow icon={DollarSign} label="Purchase Price" value={fmt(car.purchasePrice)} accent="text-blue-700" />
              {car.paymentDescription && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Notes</p>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{car.paymentDescription}</p>
                </div>
              )}
            </div>
          </DashboardSection>

          {isAdmin && (
            <DashboardSection title="Team & Contacts" subtitle="People involved" headerAccent="from-indigo-500 to-violet-500">
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-sm">
                    {purchaserName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Purchased By</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{purchaserName}</p>
                    {car.purchaseDate && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {new Date(car.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {car.purchaseCustomerDetails?.name && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                    <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                      {car.purchaseCustomerDetails.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Seller (Customer)</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{car.purchaseCustomerDetails.name}</p>
                      {car.purchaseCustomerDetails.phone && (
                        <a
                          href={`tel:${car.purchaseCustomerDetails.phone}`}
                          className="inline-flex items-center gap-1 text-xs text-violet-700 font-semibold mt-0.5 hover:underline"
                        >
                          <Phone size={11} /> {car.purchaseCustomerDetails.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {sellerName && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                      {sellerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Sold By</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{sellerName}</p>
                    </div>
                  </div>
                )}

                {!car.purchaseCustomerDetails?.name && !sellerName && (
                  <p className="text-xs text-slate-400 text-center py-2">No additional contacts</p>
                )}
              </div>
            </DashboardSection>
          )}
        </div>
      </div>

      {/* Sale panels */}
      {(car.status === 'sold' || isSalePending) && isAdmin && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {car.status === 'sold' && car.customerDetails && (
            <SaleCustomerDetailsPanel
              customer={car.customerDetails}
              soldBy={car.soldBy}
              soldDate={car.soldDate}
              sellingPrice={car.sellingPrice}
              onViewDocument={openDocumentViewer}
            />
          )}
          {isSalePending && car.saleApproval?.customerDetails && (
            <SaleCustomerDetailsPanel
              variant="light"
              customer={car.saleApproval.customerDetails}
              soldBy={car.saleApproval.requestedBy}
              sellingPrice={car.saleApproval.requestedPrice}
              onViewDocument={openDocumentViewer}
            />
          )}
        </div>
      )}

      {/* Expenses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardSection
          title="Expenses"
          subtitle={`${(car.purchaseExpenses || []).length} records · ${fmt(purchaseExpTotal)} total`}
          headerClass="bg-gradient-to-r from-blue-600 to-blue-700 [&_h3]:!text-white [&_p]:!text-blue-100"
          className="max-h-[460px] flex flex-col"
          scrollable
          badge={
            canAddPurchaseExp && car.status !== 'sold' ? (
              <Button
                variant="surface"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => setShowPurchaseExpForm(true)}
                className="!bg-white/20 !text-white !shadow-none hover:!bg-white/30 !text-xs !h-8 !px-3 !border-0"
              >
                Add
              </Button>
            ) : null
          }
        >
          {(car.purchaseExpenses || []).length === 0 ? (
            <EmptyState icon={FileText} title="No expenses" subtitle="Add transport, paperwork & acquisition costs" />
          ) : (
            <div className="space-y-2">
              {(car.purchaseExpenses || []).map((exp, idx) => (
                <ExpenseDocumentCard
                  key={exp._id}
                  expense={exp}
                  variant="purchase"
                  index={idx}
                  canDelete={canAddPurchaseExp}
                  onViewDocument={openDocumentViewer}
                  onDelete={handleDeletePurchaseExpense}
                />
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Repair Costs"
          subtitle={`${(car.repairCosts || []).length} records · ${fmt(repairExpTotal)} total`}
          headerClass="bg-gradient-to-r from-amber-500 to-orange-500 [&_h3]:!text-white [&_p]:!text-amber-100"
          className="max-h-[460px] flex flex-col"
          scrollable
          badge={
            canAddRepairExp && car.status !== 'sold' ? (
              <Button
                variant="surface"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => setShowRepairExpForm(true)}
                className="!bg-white/20 !text-white !shadow-none hover:!bg-white/30 !text-xs !h-8 !px-3 !border-0"
              >
                Log Cost
              </Button>
            ) : null
          }
        >
          {(car.repairCosts || []).length === 0 ? (
            <EmptyState icon={Wrench} title="No repair costs" subtitle="Log parts, labour & workshop expenses" />
          ) : (
            <div className="space-y-2">
              {(car.repairCosts || []).map((exp, idx) => (
                <ExpenseDocumentCard
                  key={exp._id}
                  expense={exp}
                  variant="repair"
                  index={idx}
                  canDelete={canAddRepairExp}
                  onViewDocument={openDocumentViewer}
                  onDelete={handleDeleteRepairCost}
                />
              ))}
            </div>
          )}
        </DashboardSection>
      </div>

      {/* Cost breakdown bar */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Target size={16} className="text-violet-500" />
              Investment Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">How total cost is calculated</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Net Cost</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{fmt(totalCost)}</p>
          </div>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
          <div
            className="bg-blue-500 transition-all"
            style={{ width: `${totalCost ? (car.purchasePrice / totalCost) * 100 : 33}%` }}
            title={`Purchase: ${fmt(car.purchasePrice)}`}
          />
          <div
            className="bg-sky-400 transition-all"
            style={{ width: `${totalCost ? (purchaseExpTotal / totalCost) * 100 : 0}%` }}
            title={`Expense: ${fmt(purchaseExpTotal)}`}
          />
          <div
            className="bg-amber-500 transition-all"
            style={{ width: `${totalCost ? (repairExpTotal / totalCost) * 100 : 0}%` }}
            title={`Repair: ${fmt(repairExpTotal)}`}
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { color: 'bg-blue-500', label: 'Purchase', value: fmt(car.purchasePrice) },
            { color: 'bg-sky-400', label: 'Expense', value: fmt(purchaseExpTotal) },
            { color: 'bg-amber-500', label: 'Repair', value: fmt(repairExpTotal) },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-slate-500 font-medium">{item.label}</span>
              <span className="font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
          {car.status === 'sold' && profit !== null && (
            <div className={`ml-auto flex items-center gap-2 text-xs font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isProfit ? 'Profit' : 'Loss'}: {fmt(Math.abs(profit))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      {car.status !== 'sold' && !isSalePending && (canSell || canAdvanceStatus) && (
        <div className="fixed bottom-4 left-4 right-4 lg:hidden z-50 safe-area-pb">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xl shadow-slate-900/10 p-2 flex gap-2">
            {canSell && (
              <Button
                onClick={() => setShowSellForm(true)}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/25"
                leftIcon={<DollarSign size={16} />}
              >
                Sell
              </Button>
            )}
            {canAdvanceStatus && (
              <Button
                onClick={handleStatusAdvance}
                className="flex-1 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold rounded-xl text-sm"
                rightIcon={<ChevronRight size={16} />}
              >
                {NEXT_LABEL[car.status]}
              </Button>
            )}
          </div>
        </div>
      )}

      <DocumentViewerModal
        isOpen={!!viewerDoc}
        onClose={() => setViewerDoc(null)}
        documentPath={viewerDoc?.billImage}
        expense={viewerDoc?.expense}
      />
      <ExpenseForm isOpen={showPurchaseExpForm} onClose={() => setShowPurchaseExpForm(false)} carId={car._id} type="purchase" />
      <ExpenseForm isOpen={showRepairExpForm} onClose={() => setShowRepairExpForm(false)} carId={car._id} type="repair" />
      <SellCarForm isOpen={showSellForm} onClose={() => setShowSellForm(false)} car={car} />
      <MarkReadyForm isOpen={showMarkReadyForm} onClose={() => setShowMarkReadyForm(false)} car={car} />
      <MoveToRepairModal isOpen={showMoveToRepairModal} onClose={() => setShowMoveToRepairModal(false)} car={car} />
    </DashboardPage>
  );
}
