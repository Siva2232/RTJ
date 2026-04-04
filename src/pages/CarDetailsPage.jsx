import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Car, Calendar, Fuel, User, Hash,
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Wrench,
  ShoppingCart, CheckCircle, ChevronRight, Image as ImageIcon,
  ExternalLink
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Car size={48} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Loading car detailsâ€¦</p>
        </div>
      </div>
    );
  }

  const totalCost        = calcTotalCost(car);
  const profit           = car.status === 'sold' ? calcProfit(car) : null;
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
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="relative h-56">
          {coverImage ? (
            <img
              src={coverImage}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Car size={64} className="text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <h1 className="text-2xl font-bold">{car.brand} {car.model}</h1>
            <p className="text-white/70 text-sm">{car.registrationNumber}</p>
          </div>
          <div className="absolute top-4 right-4">
            <StatusBadge status={car.status} />
          </div>
        </div>

        {/* Car Specs */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Calendar, label: 'Year',       value: car.year },
              { icon: Fuel,     label: 'Fuel',       value: car.fuelType },
              { icon: User,     label: 'Owner Type', value: `${car.ownerType} Owner` },
              { icon: CheckCircle, label: 'Status',  value: car.status },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Icon size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{label}</p>
                  <p className="text-slate-800 text-sm font-semibold capitalize">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {car.chassisNumber && (
            <div className="flex gap-2 text-sm">
              <Hash size={14} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-slate-400 text-xs">Chassis No.</p>
                <p className="text-slate-700 font-mono text-xs">{car.chassisNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-slate-400 text-xs mb-1">Purchase Price</p>
          <p className="text-slate-900 font-bold text-xl">₹{(car.purchasePrice || 0).toLocaleString('en-IN')}</p>
          <p className="text-slate-500 text-xs mt-1">{car.purchaseDate ? new Date(car.purchaseDate).toLocaleDateString('en-IN') : '—'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-slate-400 text-xs mb-1">Expenses Added</p>
          <p className="text-slate-900 font-bold text-xl">₹{(purchaseExpTotal + repairExpTotal).toLocaleString('en-IN')}</p>
          <p className="text-slate-500 text-xs mt-1">Purchase + Repair</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-slate-400 text-xs mb-1">Total Investment</p>
          <p className="text-amber-600 font-bold text-xl">₹{totalCost.toLocaleString('en-IN')}</p>
          <p className="text-slate-500 text-xs mt-1">All inclusive</p>
        </div>
        {car.status === 'sold' ? (
          <div className={`rounded-2xl border shadow-sm p-5 ${isProfit ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-xs mb-1 ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
              {isProfit ? 'Profit' : 'Loss'}
            </p>
            <p className={`font-bold text-xl ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
              ₹{Math.abs(profit).toLocaleString('en-IN')}
            </p>
            <div className={`flex items-center gap-1 mt-1 ${isProfit ? 'text-emerald-500' : 'text-red-400'}`}>
              {isProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span className="text-xs">Selling: ₹{(car.sellingPrice || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-slate-400 text-xs mb-1">Status</p>
            <p className="text-slate-700 font-semibold capitalize">{car.status}</p>
            <p className="text-slate-400 text-xs mt-1">Not yet sold</p>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Expenses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-600" />
              <h3 className="text-slate-800 font-semibold">Purchase Expenses</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-600 font-bold text-sm">₹{purchaseExpTotal.toLocaleString('en-IN')}</span>
              {canAddPurchaseExp && car.status !== 'sold' && (
                <Button variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowPurchaseExpForm(true)}>
                  Add
                </Button>
              )}
            </div>
          </div>
          <div className="p-4 space-y-2">
            {(car.purchaseExpenses || []).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No purchase expenses added</p>
            ) : (
              (car.purchaseExpenses || []).map((exp) => (
                <div key={exp._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{exp.title}</p>
                    <p className="text-slate-400 text-xs">{exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {exp.billImage && (
                      <a 
                        href={getImageUrl(exp.billImage)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        title="View Bill"
                      >
                        <ImageIcon size={14} />
                      </a>
                    )}
                    <p className="text-slate-800 font-semibold text-sm">₹{(exp.amount || 0).toLocaleString('en-IN')}</p>
                    {canAddPurchaseExp && car.status !== 'sold' && (
                      <button
                        onClick={() => handleDeletePurchaseExpense(exp._id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Repair Costs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-amber-600" />
              <h3 className="text-slate-800 font-semibold">Repair Costs</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-600 font-bold text-sm">₹{repairExpTotal.toLocaleString('en-IN')}</span>
              {canAddRepairExp && car.status !== 'sold' && (
                <Button variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowRepairExpForm(true)}>
                  Add
                </Button>
              )}
            </div>
          </div>
          <div className="p-4 space-y-2">
            {(car.repairCosts || []).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No repair costs added</p>
            ) : (
              (car.repairCosts || []).map((exp) => (
                <div key={exp._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-slate-700 text-sm font-medium">{exp.title}</p>
                    <p className="text-slate-400 text-xs">{exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {exp.billImage && (
                      <a 
                        href={getImageUrl(exp.billImage)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1"
                        title="View Bill"
                      >
                        <ImageIcon size={14} />
                      </a>
                    )}
                    <p className="text-slate-800 font-semibold text-sm">₹{(exp.amount || 0).toLocaleString('en-IN')}</p>
                    {canAddRepairExp && car.status !== 'sold' && (
                      <button
                        onClick={() => handleDeleteRepairCost(exp._id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sale Information */}
      {car.status === 'sold' && car.customerDetails && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-600" />
            Sale Information
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-xs">Customer</p>
              <p className="text-slate-800 font-semibold text-sm">{car.customerDetails.name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Phone</p>
              <p className="text-slate-800 font-semibold text-sm">{car.customerDetails.phone}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Address</p>
              <p className="text-slate-800 font-semibold text-sm">{car.customerDetails.address || 'â€”'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Sold Date</p>
              <p className="text-slate-800 font-semibold text-sm">
                {car.soldDate ? new Date(car.soldDate).toLocaleDateString('en-IN') : 'â€”'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {car.status !== 'sold' && (
        <div className="flex flex-wrap gap-3">
          {isSalePending ? (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-pulse">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-orange-900 font-semibold text-sm">Sale Approval Pending</p>
                <p className="text-orange-700 text-xs">Waiting for admin to review and approve this sale.</p>
              </div>
            </div>
          ) : (
            <>
              {canSell && (
                <Button
                  variant="success"
                  leftIcon={<DollarSign size={16} />}
                  onClick={() => setShowSellForm(true)}
                >
                  Sell Car
                </Button>
              )}
              {canAdvanceStatus && (
                <Button
                  variant="primary"
                  leftIcon={<ChevronRight size={16} />}
                  onClick={handleStatusAdvance}
                >
                  {NEXT_LABEL[car.status]}
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <ExpenseForm isOpen={showPurchaseExpForm} onClose={() => setShowPurchaseExpForm(false)} carId={car._id} type="purchase" />
      <ExpenseForm isOpen={showRepairExpForm}   onClose={() => setShowRepairExpForm(false)}   carId={car._id} type="repair" />
      <SellCarForm isOpen={showSellForm}        onClose={() => setShowSellForm(false)}         car={car} />
      <MarkReadyForm isOpen={showMarkReadyForm} onClose={() => setShowMarkReadyForm(false)}   car={car} />
    </div>
  );
}
