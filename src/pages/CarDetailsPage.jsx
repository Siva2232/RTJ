import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Car, Calendar, Fuel, User, Hash,
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Wrench,
  ShoppingCart, CheckCircle, ChevronRight, Image as ImageIcon,
  Info, MapPin, Phone, ShieldCheck, Target, Gauge
} from 'lucide-react';
import {
  fetchCarById,
  selectCarById,
  calcTotalCost,
  calcProfit,
  updateStatusThunk,
  deletePurchaseExpenseThunk,
  deleteRepairCostThunk,
} from '../store/slices/carSlice';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ExpenseForm from '../components/car/ExpenseForm';
import SellCarForm from '../components/car/SellCarForm';
import MarkReadyForm from '../components/car/MarkReadyForm';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/helper';

const STATUS_FLOW = { purchased: 'repair', repair: 'ready', ready: null };
const NEXT_LABEL = { purchased: 'Move to Repair', repair: 'Mark as Ready' };

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

  useEffect(() => {
    dispatch(fetchCarById(id));
  }, [id, dispatch]);

  if (!car) {
    return (
      <div className="flex items-center justify-center h-[60vh] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Car size={32} className="text-slate-300 animate-pulse" />
          </div>
          <p className="text-slate-500 font-semibold tracking-tight">Loading vehicle details...</p>
        </motion.div>
      </div>
    );
  }

  const totalCost = calcTotalCost(car);
  const profit = car.status === 'sold' ? calcProfit(car) : null;
  const purchaseExpTotal = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const repairExpTotal = (car.repairCosts || []).reduce((s, e) => s + (e.amount || 0), 0);
  const isProfit = profit !== null && profit >= 0;

  const canAddPurchaseExp = user?.role === 'admin' || user?.role === 'purchase';
  const canAddRepairExp = user?.role === 'admin' || user?.role === 'sales';
  const canSell = (user?.role === 'admin' || user?.role === 'sales') && car.status === 'ready';
  const isSalePending = car.status === 'sale_pending';
  const canAdvanceStatus = (user?.role === 'admin' || user?.role === 'sales') && STATUS_FLOW[car.status];

  const handleStatusAdvance = async () => {
    const next = STATUS_FLOW[car.status];
    if (!next) return;
    if (next === 'ready') {
      setShowMarkReadyForm(true);
      return;
    }
    const result = await dispatch(updateStatusThunk({ carId: car._id, status: next }));
    if (updateStatusThunk.fulfilled.match(result)) {
      toast.success(`Status updated to "${next}"`);
    } else {
      toast.error(result.payload || 'Failed to update status');
    }
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

  const coverImage = getImageUrl(car.repairImages?.[0] || car.images?.[0]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-all self-start"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 group-hover:border-blue-200 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm">Back to Inventory</span>
          </button>

          <div className="flex items-center gap-3">
            {car.status !== 'sold' && !isSalePending && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {canSell && (
                  <Button variant="success" size="sm" leftIcon={<DollarSign size={16} />} onClick={() => setShowSellForm(true)} className="w-full sm:w-auto">
                    Sell Vehicle
                  </Button>
                )}
                {canAdvanceStatus && (
                  <Button variant="primary" size="sm" leftIcon={<ChevronRight size={16} />} onClick={handleStatusAdvance} className="w-full sm:w-auto">
                    {NEXT_LABEL[car.status]}
                  </Button>
                )}
              </div>
            )}
            <StatusBadge status={car.status} className="px-4 py-1.5 text-sm shadow-sm" />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="relative h-[260px] sm:h-[320px] md:h-[420px] lg:h-[480px]">
            {coverImage ? (
              <img
                src={coverImage}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-slate-100">
                <Car size={80} className="text-slate-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                {car.brand} <span className="font-light">{car.model}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-2xl text-sm font-bold tracking-widest uppercase shadow-lg">
                  {car.registrationNumber}
                </span>
                {car.year && <span className="text-white/90 text-lg font-medium">{car.year} Model</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: Calendar, label: 'Year of Mfg', value: car.year },
            { icon: Fuel, label: 'Fuel Engine', value: car.fuelType },
            { icon: Gauge, label: 'Kilometers', value: car.mileage ? `${car.mileage.toLocaleString('en-IN')} km` : '—' },
            { icon: User, label: 'Ownership', value: `${car.ownerType} Owner` },
            { icon: ShieldCheck, label: 'Status', value: car.status?.replace('_', ' ') },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white p-5 rounded-3xl border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-2xl text-slate-500"><Icon size={20} /></div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
                <p className="text-slate-900 font-semibold text-lg mt-0.5 capitalize">{value || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl"><DollarSign size={20} /></div>
            <h3 className="font-black text-lg">Payment Details</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Method</p>
              <p className="text-slate-900 font-black text-lg mt-1 uppercase">{car.paymentMode || 'Cash'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transaction Ref (UTR)</p>
              <p className="text-slate-900 font-black text-lg mt-1">{car.utrNumber || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Payment Date</p>
              <p className="text-slate-900 font-black text-lg mt-1">
                {car.paymentDate ? new Date(car.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Notes</p>
              <p className="text-slate-600 font-medium text-sm mt-1">{car.paymentDescription || 'No additional notes'}</p>
            </div>
          </div>
        </div>

        {/* Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Base Purchase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><ShoppingCart size={22} /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Purchase Price</p>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{(car.purchasePrice || 0).toLocaleString('en-IN')}</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Wrench size={22} /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Expenses</p>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{(purchaseExpTotal + repairExpTotal).toLocaleString('en-IN')}</p>
          </div>

          {/* Net Investment */}
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white lg:col-span-1">
            <div className="w-11 h-11 bg-slate-800 rounded-2xl flex items-center justify-center mb-4"><Target size={22} /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Net Investment</p>
            <p className="text-3xl font-black mt-1">₹{totalCost.toLocaleString('en-IN')}</p>
          </div>

          {/* Profit / Loss */}
          {car.status === 'sold' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-3xl p-6 ${isProfit ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                {isProfit ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
              </div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{isProfit ? 'PROFIT' : 'LOSS'}</p>
              <p className="text-3xl font-black mt-1">₹{Math.abs(profit).toLocaleString('en-IN')}</p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
              <DollarSign size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-400 font-bold text-sm">PROFIT PENDING</p>
            </div>
          )}
        </div>

        {/* Expense Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Purchase Expenses */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl"><ShoppingCart size={20} /></div>
                <h3 className="font-black text-lg">Sourcing Costs</h3>
              </div>
              {canAddPurchaseExp && car.status !== 'sold' && (
                <Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => setShowPurchaseExpForm(true)}>
                  Add
                </Button>
              )}
            </div>
            <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
              {(car.purchaseExpenses || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400">No sourcing expenses recorded</div>
              ) : (
                (car.purchaseExpenses || []).map((exp) => (
                  <div key={exp._id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 group">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-400">{exp.date ? new Date(exp.date).getDate() : '—'}</p>
                      </div>
                      <div>
                        <p className="font-semibold">{exp.title}</p>
                        <p className="text-xs text-slate-500">{exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black">₹{exp.amount.toLocaleString('en-IN')}</span>
                      {canAddPurchaseExp && (
                        <button onClick={() => handleDeletePurchaseExpense(exp._id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-blue-50 px-6 py-4 flex justify-between font-black text-blue-700">
              <span>Total Sourcing</span>
              <span>₹{purchaseExpTotal.toLocaleString('en-IN')}</span>
            </div>
          </section>

          {/* Repair Expenses */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 text-white rounded-2xl"><Wrench size={20} /></div>
                <h3 className="font-black text-lg">Refurbishment Log</h3>
              </div>
              {canAddRepairExp && car.status !== 'sold' && (
                <Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => setShowRepairExpForm(true)}>
                  Log
                </Button>
              )}
            </div>
            <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
              {(car.repairCosts || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400">No repair costs recorded</div>
              ) : (
                (car.repairCosts || []).map((exp) => (
                  <div key={exp._id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-amber-200 group">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-400">{exp.date ? new Date(exp.date).getDate() : '—'}</p>
                      </div>
                      <div>
                        <p className="font-semibold">{exp.title}</p>
                        <p className="text-xs text-slate-500">{exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black">₹{exp.amount.toLocaleString('en-IN')}</span>
                      {canAddRepairExp && (
                        <button onClick={() => handleDeleteRepairCost(exp._id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-amber-50 px-6 py-4 flex justify-between font-black text-amber-700">
              <span>Total Repairs</span>
              <span>₹{repairExpTotal.toLocaleString('en-IN')}</span>
            </div>
          </section>
        </div>

        {/* Sold Customer Details */}
        {car.status === 'sold' && car.customerDetails && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white">
            <h3 className="font-black text-2xl mb-6 flex items-center gap-3">
              <DollarSign className="text-emerald-500" /> Ownership Transfer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-10">
              <div><p className="text-xs uppercase text-slate-400">Customer</p><p className="font-bold text-lg">{car.customerDetails.name}</p></div>
              <div><p className="text-xs uppercase text-slate-400">Phone</p><p className="font-bold text-lg">{car.customerDetails.phone}</p></div>
              <div><p className="text-xs uppercase text-slate-400">Address</p><p className="font-medium">{car.customerDetails.address || '—'}</p></div>
              <div><p className="text-xs uppercase text-slate-400">Sold On</p><p className="font-bold">{car.soldDate ? new Date(car.soldDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Floating Action Bar */}
      {car.status !== 'sold' && !isSalePending && (canSell || canAdvanceStatus) && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-3 flex gap-3">
            {canSell && (
              <Button onClick={() => setShowSellForm(true)} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl">
                Sell Vehicle
              </Button>
            )}
            {canAdvanceStatus && (
              <Button onClick={handleStatusAdvance} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl">
                {NEXT_LABEL[car.status]}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseForm isOpen={showPurchaseExpForm} onClose={() => setShowPurchaseExpForm(false)} carId={car._id} type="purchase" />
      <ExpenseForm isOpen={showRepairExpForm} onClose={() => setShowRepairExpForm(false)} carId={car._id} type="repair" />
      <SellCarForm isOpen={showSellForm} onClose={() => setShowSellForm(false)} car={car} />
      <MarkReadyForm isOpen={showMarkReadyForm} onClose={() => setShowMarkReadyForm(false)} car={car} />
    </div>
  );
}