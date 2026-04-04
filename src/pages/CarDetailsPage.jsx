import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Car, Calendar, Fuel, User, Hash,
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Wrench,
  ShoppingCart, CheckCircle, ChevronRight, Image as ImageIcon,
  ExternalLink, Info, MapPin, Phone, ShieldCheck,Target ,Gauge 
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
const NEXT_LABEL  = { purchased: 'Move to Repair', repair: 'Mark as Ready' };

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const car = useSelector(selectCarById(id));

  const [showPurchaseExpForm, setShowPurchaseExpForm] = useState(false);
  const [showRepairExpForm, setShowRepairExpForm]   = useState(false);
  const [showSellForm, setShowSellForm]             = useState(false);
  const [showMarkReadyForm, setShowMarkReadyForm]   = useState(false);

  useEffect(() => {
    dispatch(fetchCarById(id));
  }, [id, dispatch]);

  if (!car) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
             <Car size={32} className="text-slate-300 animate-pulse" />
          </div>
          <p className="text-slate-500 font-semibold tracking-tight">Accessing vehicle data...</p>
        </motion.div>
      </div>
    );
  }

  const totalCost         = calcTotalCost(car);
  const profit            = car.status === 'sold' ? calcProfit(car) : null;
  const purchaseExpTotal = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const repairExpTotal   = (car.repairCosts     || []).reduce((s, e) => s + (e.amount || 0), 0);
  const isProfit         = profit !== null && profit >= 0;

  const canAddPurchaseExp = user?.role === 'admin' || user?.role === 'purchase';
  const canAddRepairExp   = user?.role === 'admin' || user?.role === 'sales';
  const canSell           = (user?.role === 'admin' || user?.role === 'sales') && car.status === 'ready';
  const isSalePending     = car.status === 'sale_pending';
  const canAdvanceStatus  = (user?.role === 'admin' || user?.role === 'sales') && STATUS_FLOW[car.status];

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
    if (deletePurchaseExpenseThunk.fulfilled.match(result)) {
      toast.success('Expense removed');
    } else {
      toast.error(result.payload || 'Failed to remove expense');
    }
  };

  const handleDeleteRepairCost = async (repairId) => {
    const result = await dispatch(deleteRepairCostThunk({ carId: car._id, repairId }));
    if (deleteRepairCostThunk.fulfilled.match(result)) {
      toast.success('Repair cost removed');
    } else {
      toast.error(result.payload || 'Failed to remove repair cost');
    }
  };

  const coverImage = getImageUrl(car.repairImages?.[0] || car.images?.[0]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all"
        >
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-blue-200 transition-colors">
            <ArrowLeft size={18} /> 
          </div>
          <span className="text-sm">Inventory List</span>
        </button>

        <div className="flex items-center gap-4">
           {car.status !== 'sold' && !isSalePending && (
             <div className="hidden md:flex gap-2">
                {canSell && (
                  <Button variant="success" size="sm" leftIcon={<DollarSign size={16} />} onClick={() => setShowSellForm(true)}>Sell Vehicle</Button>
                )}
                {canAdvanceStatus && (
                  <Button variant="primary" size="sm" leftIcon={<ChevronRight size={16} />} onClick={handleStatusAdvance}>{NEXT_LABEL[car.status]}</Button>
                )}
             </div>
           )}
           <StatusBadge status={car.status} className="px-4 py-1 text-sm shadow-sm" />
        </div>
      </div>

      {/* Hero Vehicle Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden group">
          <div className="relative h-[300px] md:h-[450px]">
            {coverImage ? (
              <img
                src={coverImage}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-slate-100">
                <Car size={80} className="text-slate-300 mb-2" />
                <p className="text-slate-400 font-medium">No vehicle images available</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8">
              <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-md">
                {car.brand} <span className="font-light">{car.model}</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase shadow-lg shadow-blue-900/20">
                  {car.registrationNumber}
                </span>
                {car.year && <span className="text-white/80 font-semibold">{car.year} Model</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Core Specs Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-slate-900 font-extrabold text-lg mb-6 flex items-center gap-2">
              <Info size={18} className="text-blue-600" />
              Technical Specs
            </h3>
            <div className="space-y-4">
              {[
                { icon: Calendar, label: 'Year of Mfg', value: car.year },
                { icon: Fuel,     label: 'Fuel Engine', value: car.fuelType },
                { icon: Gauge,    label: 'Kilometers', value: car.mileage ? `${car.mileage.toLocaleString('en-IN')} km` : '0 km' },
                { icon: User,     label: 'Ownership', value: `${car.ownerType} Owner` },
                { icon: ShieldCheck, label: 'Current Status', value: car.status },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-slate-500"><Icon size={16} /></div>
                    <span className="text-slate-400 text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-slate-900 font-bold text-sm capitalize">{value || 'N/A'}</span>
                </div>
              ))}
            </div>
            {car.chassisNumber && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-tighter mb-1">Chassis Identifier</p>
                <div className="bg-slate-950 text-blue-400 p-3 rounded-xl font-mono text-xs break-all border border-slate-800">
                  {car.chassisNumber}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Intelligence Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm group hover:border-blue-200 transition-all">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><ShoppingCart size={20} /></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Base Purchase</p>
          <p className="text-slate-900 font-black text-2xl mt-1">₹{(car.purchasePrice || 0).toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-2 font-medium">
            <Calendar size={12} /> {car.purchaseDate ? new Date(car.purchaseDate).toLocaleDateString('en-IN') : 'Date not set'}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4"><Wrench size={20} /></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Maintenance Load</p>
          <p className="text-slate-900 font-black text-2xl mt-1">₹{(purchaseExpTotal + repairExpTotal).toLocaleString('en-IN')}</p>
          <p className="text-amber-600/80 text-[11px] mt-2 font-bold italic">Cumulative Expenses</p>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-900/20 ring-4 ring-white">
          <div className="w-10 h-10 bg-slate-800 text-blue-400 rounded-xl flex items-center justify-center mb-4"><Target size={20} /></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Net Investment</p>
          <p className="text-white font-black text-2xl mt-1">₹{totalCost.toLocaleString('en-IN')}</p>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
             <div className="bg-blue-500 h-full w-[70%]" />
          </div>
        </div>

        {car.status === 'sold' ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-[2rem] p-6 shadow-lg ${isProfit ? 'bg-emerald-600 text-white shadow-emerald-900/10' : 'bg-rose-600 text-white shadow-rose-900/10'}`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{isProfit ? 'Realized Profit' : 'Realized Loss'}</p>
            <p className="font-black text-2xl mt-1">₹{Math.abs(profit).toLocaleString('en-IN')}</p>
            <p className="text-white/80 text-[11px] mt-2 font-medium">Sold for ₹{(car.sellingPrice || 0).toLocaleString('en-IN')}</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-2"><DollarSign size={20} /></div>
            <p className="text-slate-400 text-xs font-bold">VALUATION PENDING</p>
            <p className="text-slate-300 text-[10px] mt-1">Profit/Loss calculated at checkout</p>
          </div>
        )}
      </div>

      {/* Expense Management Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purchase Expenses Container */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-900/20"><ShoppingCart size={18} /></div>
              <h3 className="text-slate-900 font-black text-lg tracking-tight">Sourcing Costs</h3>
            </div>
            {canAddPurchaseExp && car.status !== 'sold' && (
              <Button variant="outline" size="sm" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50" leftIcon={<Plus size={14} />} onClick={() => setShowPurchaseExpForm(true)}>Add Entry</Button>
            )}
          </div>
          <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
            {(car.purchaseExpenses || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><Info size={20} className="text-slate-300" /></div>
                <p className="text-slate-400 text-sm italic">No sourcing costs recorded yet.</p>
              </div>
            ) : (
              (car.purchaseExpenses || []).map((exp) => (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={exp._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-md hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs">{exp.date ? new Date(exp.date).getDate() : '?'}</div>
                    <div>
                      <p className="text-slate-900 text-sm font-bold">{exp.title}</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase">{exp.date ? new Date(exp.date).toLocaleDateString('en-IN', {month: 'short', year: 'numeric'}) : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-900 font-black text-sm">₹{exp.amount.toLocaleString('en-IN')}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {exp.billImage && (
                        <a href={getImageUrl(exp.billImage)} target="_blank" rel="noreferrer" className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><ImageIcon size={14} /></a>
                      )}
                      {canAddPurchaseExp && car.status !== 'sold' && (
                        <button onClick={() => handleDeletePurchaseExpense(exp._id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <div className="px-8 py-4 bg-blue-50/50 flex justify-between items-center">
             <span className="text-blue-900/60 text-xs font-black uppercase tracking-widest">Total Sourcing</span>
             <span className="text-blue-600 font-black">₹{purchaseExpTotal.toLocaleString('en-IN')}</span>
          </div>
        </section>

        {/* Repair Costs Container */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-900/20"><Wrench size={18} /></div>
              <h3 className="text-slate-900 font-black text-lg tracking-tight">Refurbishment Log</h3>
            </div>
            {canAddRepairExp && car.status !== 'sold' && (
              <Button variant="outline" size="sm" className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50" leftIcon={<Plus size={14} />} onClick={() => setShowRepairExpForm(true)}>Log Expense</Button>
            )}
          </div>
          <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
            {(car.repairCosts || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><Info size={20} className="text-slate-300" /></div>
                <p className="text-slate-400 text-sm italic">Vehicle is currently in pristine condition.</p>
              </div>
            ) : (
              (car.repairCosts || []).map((exp) => (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={exp._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-md hover:border-amber-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs">{exp.date ? new Date(exp.date).getDate() : '?'}</div>
                    <div>
                      <p className="text-slate-900 text-sm font-bold">{exp.title}</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase">{exp.date ? new Date(exp.date).toLocaleDateString('en-IN', {month: 'short', year: 'numeric'}) : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-900 font-black text-sm">₹{exp.amount.toLocaleString('en-IN')}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {exp.billImage && (
                        <a href={getImageUrl(exp.billImage)} target="_blank" rel="noreferrer" className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"><ImageIcon size={14} /></a>
                      )}
                      {canAddRepairExp && car.status !== 'sold' && (
                        <button onClick={() => handleDeleteRepairCost(exp._id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <div className="px-8 py-4 bg-amber-50/50 flex justify-between items-center">
             <span className="text-amber-900/60 text-xs font-black uppercase tracking-widest">Total Repairs</span>
             <span className="text-amber-600 font-black">₹{repairExpTotal.toLocaleString('en-IN')}</span>
          </div>
        </section>
      </div>

      {/* Sale / Customer Information */}
      {car.status === 'sold' && car.customerDetails && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h3 className="text-white font-black text-2xl mb-8 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl"><DollarSign size={20} className="text-white" /></div>
            Ownership Transfer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Customer Name</p>
              <div className="flex items-center gap-2 text-white">
                <User size={14} className="text-emerald-500" />
                <p className="font-bold">{car.customerDetails.name}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Contact Number</p>
              <div className="flex items-center gap-2 text-white">
                <Phone size={14} className="text-emerald-500" />
                <p className="font-bold">{car.customerDetails.phone}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Billing Address</p>
              <div className="flex items-center gap-2 text-white">
                <MapPin size={14} className="text-emerald-500" />
                <p className="font-bold truncate max-w-[200px]">{car.customerDetails.address || '—'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Finalized Date</p>
              <div className="flex items-center gap-2 text-white">
                <Calendar size={14} className="text-emerald-500" />
                <p className="font-bold">{car.soldDate ? new Date(car.soldDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'}) : '—'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Action Bar (Mobile) / Bottom Status Banner */}
      {car.status !== 'sold' && (
        <div className="sticky bottom-6 left-0 right-0 px-4 md:px-0 z-20">
          <div className="max-w-xl mx-auto">
            {isSalePending ? (
              <div className="bg-orange-600 text-white rounded-[2rem] p-4 shadow-2xl shadow-orange-900/40 flex items-center justify-between px-8 border border-orange-500">
                <div className="flex items-center gap-4">
                   <div className="bg-white/20 p-2 rounded-full animate-pulse"><Info size={20} /></div>
                   <div>
                     <p className="font-black text-sm uppercase">Sale Authorized</p>
                     <p className="text-[10px] text-white/80">Pending Final Executive Signature</p>
                   </div>
                </div>
                <div className="h-8 w-[1px] bg-white/20 mx-4" />
                <StatusBadge status="sale_pending" className="bg-white/10 text-white border-white/20" />
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-3 shadow-2xl flex items-center gap-3">
                {canSell && (
                  <button
                    onClick={() => setShowSellForm(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-[2rem] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
                  >
                    <DollarSign size={18} /> Sell Vehicle
                  </button>
                )}
                {canAdvanceStatus && (
                  <button
                    onClick={handleStatusAdvance}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-[2rem] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
                  >
                    <ChevronRight size={18} /> {NEXT_LABEL[car.status]}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseForm isOpen={showPurchaseExpForm} onClose={() => setShowPurchaseExpForm(false)} carId={car._id} type="purchase" />
      <ExpenseForm isOpen={showRepairExpForm}   onClose={() => setShowRepairExpForm(false)}   carId={car._id} type="repair" />
      <SellCarForm isOpen={showSellForm}        onClose={() => setShowSellForm(false)}         car={car} />
      <MarkReadyForm isOpen={showMarkReadyForm} onClose={() => setShowMarkReadyForm(false)}    car={car} />
    </div>
  );
}