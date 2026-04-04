import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Car, DollarSign, TrendingUp, ShoppingBag, Wrench, CheckCircle, AlertTriangle, Clock, Target, ChevronRight } from "lucide-react";
import { selectDashboardStats, selectAllCars, calcTotalCost, calcProfit, fetchCars, approveSaleThunk } from "../store/slices/carSlice";
import toast from "react-hot-toast";
import StatCard from "../components/ui/StatCard";
import { getImageUrl } from "../utils/helper";
import Button from "../components/ui/Button";
import ProfitChart from "../components/charts/ProfitChart";
import ExpenseChart from "../components/charts/ExpenseChart";
import NotificationBanner from "../components/ui/NotificationBanner";
import SaleApprovalModal from "../components/car/SaleApprovalModal";
import { StatusBadge, ProfitBadge } from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const cars = useSelector(selectAllCars);
  const navigate = useNavigate();

  const [approvalModal, setApprovalModal] = useState({ isOpen: false, car: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  const recentCars = [...cars]
    .sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt))
    .slice(0, 5);

  const lossMakingCars = cars.filter(
    (c) => c.status === "sold" && calcProfit(c) < 0
  );

  const pendingSales = cars.filter((c) => c.status === "sale_pending");

  const handleApproveAction = async (carId, action) => {
    setLoading(true);
    const res = await dispatch(approveSaleThunk({ carId, action }));
    setLoading(false);
    if (approveSaleThunk.fulfilled.match(res)) {
      toast.success(action === "approve" ? "Sale approved!" : "Sale rejected");
      setApprovalModal({ isOpen: false, car: null });
    } else {
      toast.error(res.payload || "Action failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cars" value={stats.totalCars} icon={Car} color="blue" trend={12} trendLabel="this month" />
        <StatCard title="Total Investment" value={stats.totalInvestment} icon={DollarSign} color="amber" prefix="₹" />
        <StatCard title="Cars Sold" value={stats.soldCars} icon={ShoppingBag} color="purple" trend={8} trendLabel="vs last month" />
        <StatCard title="Total Profit" value={stats.totalProfit} icon={TrendingUp} color={stats.totalProfit >= 0 ? "green" : "red"} prefix="₹" />
      </div>

      <AnimatePresence>
        {pendingSales.length > 0 && (
          <div className="mb-6">
            <NotificationBanner
              id="pending-approvals" title="Sale Approvals Required"
              message={pendingSales.length === 1 ? `"${pendingSales[0].brand} ${pendingSales[0].model}" is waiting for your review` : `There are ${pendingSales.length} cars waiting for your review in the pending list below`}
              type="warning" actionLabel="Review Now"
              onAction={() => { const el = document.getElementById("pending-approvals-section"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
              onDismiss={() => {}}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Purchased", count: cars.filter(c => c.status === "purchased").length, icon: Car, color: "bg-blue-50 text-blue-600" },
          { label: "In Repair", count: stats.carsInRepair, icon: Wrench, color: "bg-amber-50 text-amber-600" },
          { label: "Ready to Sell", count: stats.carsReady, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
        ].map(({ label, count, icon: Icon, color }) => (
          <motion.div key={label} whileHover={{ y: -1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}><Icon size={20} /></div>
            <div><p className="text-slate-500 text-xs">{label}</p><p className="text-slate-900 text-xl font-bold">{count}</p></div>
          </motion.div>
        ))}
      </div>

      {pendingSales.length > 0 && (
        <div id="pending-approvals-section" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden relative mt-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 opacity-50" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              <h3 className="text-slate-900 font-semibold">Pending Sale Approvals</h3>
            </div>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">{pendingSales.length} Pending</span>
          </div>
          <div className="space-y-4">
            {pendingSales.map((car) => (
              <div key={car._id} className="group bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow group-hover:scale-105 transition-all"><Car size={24} className="text-slate-400" /></div>
                    <div>
                      <p className="text-slate-900 font-bold">{car.brand} {car.model}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5"><Target size={12} /> Requested: <span className="font-semibold text-slate-800">₹{(car.saleApproval?.requestedPrice / 100000).toFixed(2)}L</span></p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-40 border-l border-slate-200 pl-4 ml-2">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Customer</p>
                    <p className="text-slate-700 text-sm font-semibold">{car.saleApproval?.customerDetails?.name || "Walk-in"}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{car.saleApproval?.customerDetails?.phone}</p>
                  </div>
                  <div className="flex-1 min-w-40 border-l border-slate-200 pl-4 ml-2">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Purchase Payment</p>
                    <p className="text-blue-700 text-xs font-bold uppercase">{car.paymentMode || 'Cash'} {car.utrNumber ? `• ${car.utrNumber}` : ''}</p>
                    <p className="text-slate-500 text-[10px] font-medium mt-0.5">
                      {car.paymentDate ? new Date(car.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'} 
                      {car.paymentDescription ? ` • ${car.paymentDescription}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-amber-200" onClick={() => setApprovalModal({ isOpen: true, car })}>Review Request</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SaleApprovalModal isOpen={approvalModal.isOpen} onClose={() => setApprovalModal({ isOpen: false, car: null })} car={approvalModal.car} loading={loading} onConfirm={(action) => handleApproveAction(approvalModal.car?._id, action)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ProfitChart /></div>
        <div><ExpenseChart /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-slate-900 font-semibold mb-4">Recent Cars</h3>
          <div className="space-y-3">
            {recentCars.map((car) => {
              const totalCost = calcTotalCost(car);
              const profit = car.status === "sold" ? calcProfit(car) : null;
              return (
                <div key={car._id} onClick={() => navigate(`/inventory/${car._id}`)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {(car.images?.[0] || car.repairImages?.[0]) ? (
                      <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Car size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-medium truncate">{car.brand} {car.model}</p>
                    <p className="text-slate-500 text-xs">{car.registrationNumber} � {car.purchaseDate ? new Date(car.purchaseDate).toLocaleDateString("en-IN") : ""}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0"><StatusBadge status={car.status} /> {profit !== null && <ProfitBadge profit={profit} />}</div>
                  <p className="text-slate-600 text-sm font-medium flex-shrink-0">₹{(totalCost / 100000).toFixed(1)}L</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4"><AlertTriangle size={16} className="text-red-500" /><h3 className="text-slate-900 font-semibold">Loss Alert</h3></div>
          {lossMakingCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3"><CheckCircle size={24} className="text-emerald-600" /></div>
              <p className="text-slate-600 text-sm font-medium">All good!</p><p className="text-slate-400 text-xs mt-1">No loss-making cars</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lossMakingCars.map((car) => (
                <div key={car._id} onClick={() => navigate(`/inventory/${car._id}`)} className="p-3 bg-red-50 border border-red-100 rounded-xl cursor-pointer hover:border-red-200 transition-colors">
                  <p className="text-slate-800 text-sm font-medium">{car.brand} {car.model}</p>
                  <p className="text-red-600 text-xs font-semibold mt-1">Loss: ₹{Math.abs(calcProfit(car)).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

