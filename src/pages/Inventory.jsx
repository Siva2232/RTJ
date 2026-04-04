import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Car, LayoutGrid, List, Filter, 
  ArrowUpDown, ChevronRight, Fuel, Calendar, User, IndianRupee 
} from 'lucide-react';
import { getImageUrl } from '../utils/helper';
import {
  fetchCars,
  selectFilteredCars,
  setFilterStatus,
  setSearchQuery,
  setSortBy,
  calcTotalCost,
  calcProfit,
} from '../store/slices/carSlice';
import CarCard from '../components/car/CarCard';
import CarForm from '../components/car/CarForm';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';

const STATUS_FILTERS = [
  { label: 'All Stock', value: 'all' },
  { label: 'Purchased', value: 'purchased' },
  { label: 'In Repair', value: 'repair' },
  { label: 'Ready', value: 'ready' },
  { label: 'Sold', value: 'sold' },
];

const SORT_OPTIONS = [
  { label: 'Recently Added', value: 'date' },
  { label: 'Highest Profit', value: 'profit' },
  { label: 'Total Investment', value: 'cost' },
];

const InventoryListRow = memo(function InventoryListRow({ car }) {
  const navigate = useNavigate();
  const totalCost = calcTotalCost(car);
  const profit = car.status === 'sold' ? calcProfit(car) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => navigate(`/inventory/${car._id}`)}
      className="group flex items-center gap-6 px-6 py-4 hover:bg-blue-50/40 cursor-pointer transition-all border-b border-slate-50 last:border-0"
    >
      {/* Vehicle Thumbnail */}
      <div className="w-20 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
        {(car.images?.[0] || car.repairImages?.[0]) ? (
          <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Car size={20} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-slate-900 font-black truncate">
            {car.brand} <span className="font-medium text-slate-500">{car.model}</span>
          </p>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{car.year}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
          <span>{car.registrationNumber}</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span>{car.fuelType}</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span>{car.ownerType} Owner</span>
        </div>
      </div>

      {/* Status */}
      <div className="hidden sm:block">
        <StatusBadge status={car.status} className="scale-90" />
      </div>

      {/* Financials */}
      <div className="text-right w-32 hidden sm:block">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Investment</p>
        <p className="text-slate-900 font-black text-sm">
          ₹{(totalCost / 100000).toFixed(2)}L
        </p>
      </div>

      {profit !== null && (
        <div className="text-right w-32 hidden md:block">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">P&L</p>
          <p className={`font-black text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {profit >= 0 ? '+' : ''}₹{(profit / 1000).toFixed(0)}K
          </p>
        </div>
      )}

      <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
        <ChevronRight size={18} />
      </div>
    </motion.div>
  );
});

export default function Inventory() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const filteredCars = useSelector(selectFilteredCars);
  const { filterStatus, searchQuery, sortBy } = useSelector((s) => s.cars);

  const [showCarForm, setShowCarForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setSearchQuery(localSearch)), 250);
    return () => clearTimeout(t);
  }, [localSearch, dispatch]);

  const handleFilter = useCallback((v) => dispatch(setFilterStatus(v)), [dispatch]);
  const handleSort = useCallback((v) => dispatch(setSortBy(v)), [dispatch]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-slate-900 text-3xl font-black tracking-tight">Showroom Inventory</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />)}
            </div>
            <p className="text-slate-500 text-sm font-medium tracking-tight">
              Monitoring <span className="text-blue-600 font-bold">{filteredCars.length}</span> active vehicles
            </p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'purchase') && (
          <Button 
            variant="primary" 
            className="rounded-2xl shadow-lg shadow-blue-900/10 h-12 px-6"
            leftIcon={<Plus size={18} />} 
            onClick={() => setShowCarForm(true)}
          >
            Aquire Vehicle
          </Button>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Box */}
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search make, model, or VIN..."
              className="w-full pl-12 pr-4 h-12 text-sm font-medium bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-100 px-3 h-12 rounded-2xl min-w-[160px]">
              <ArrowUpDown size={16} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none w-full"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-2xl h-12">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={16} /> <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={16} /> <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-6 flex-wrap border-t border-slate-50 pt-6">
          <div className="flex items-center gap-2 mr-2 text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Status:</span>
          </div>
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleFilter(value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === value
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {filteredCars.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100">
              <Car size={48} className="text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-black text-xl">Inventory Empty</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-[240px] text-center font-medium">No vehicles match your current search or filter criteria.</p>
            <button 
              onClick={() => { setLocalSearch(''); handleFilter('all'); }}
              className="mt-6 text-blue-600 font-bold text-sm hover:underline underline-offset-4"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="divide-y divide-slate-50">
              {filteredCars.map((car) => (
                <InventoryListRow key={car._id} car={car} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CarForm isOpen={showCarForm} onClose={() => setShowCarForm(false)} />
    </div>
  );
}