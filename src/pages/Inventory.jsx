import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, Plus, Car, LayoutGrid, List, Filter,
  ArrowUpDown, ChevronRight, User,
} from 'lucide-react';
import { getImageUrl } from '../utils/helper';
import {
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
  { label: 'All', value: 'all', color: 'bg-slate-600' },
  { label: 'Purchased', value: 'purchased', color: 'bg-blue-500' },
  { label: 'Repair', value: 'repair', color: 'bg-amber-500' },
  { label: 'Ready', value: 'ready', color: 'bg-emerald-500' },
  { label: 'Sold', value: 'sold', color: 'bg-violet-500' },
  { label: '1M+', value: '1m', color: 'bg-orange-500' },
  { label: '3M+', value: '3m', color: 'bg-orange-600' },
  { label: '6M+', value: '6m', color: 'bg-red-500' },
  { label: 'Junk', value: 'junk', color: 'bg-rose-600' },
];

const SORT_OPTIONS = [
  { label: 'Recently Added', value: 'date' },
  { label: 'Highest Profit', value: 'profit' },
  { label: 'Total Investment', value: 'cost' },
];

const InventoryListRow = memo(function InventoryListRow({ car, isAdmin }) {
  const navigate = useNavigate();
  const totalCost = calcTotalCost(car);
  const profit = car.status === 'sold' ? calcProfit(car) : null;
  const purchaserName = car.purchasedBy?.name;
  const sellerCustomer = car.purchaseCustomerDetails;

  return (
    <div
      onClick={() => navigate(`/inventory/${car._id}`)}
      className="group cursor-pointer transition-colors border-b border-slate-50 last:border-0 hover:bg-blue-50/40 active:bg-blue-50/60"
    >
      {/* Mobile card layout */}
      <div className="flex flex-col gap-3 p-4 sm:hidden">
        <div className="flex gap-3">
          <div className="w-24 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
            {(car.images?.[0] || car.repairImages?.[0]) ? (
              <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Car size={22} className="text-slate-300" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-slate-900 font-bold text-sm leading-tight truncate">
                {car.brand} {car.model}
              </p>
              <StatusBadge status={car.status} />
            </div>
            <p className="text-slate-500 text-xs mt-1">{car.registrationNumber} · {car.year}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{car.fuelType} · {car.ownerType} Owner</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Investment</p>
            <p className="text-blue-700 font-bold text-sm">₹{(totalCost / 100000).toFixed(2)}L</p>
          </div>
          {profit !== null && (
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">P&L</p>
              <p className={`font-bold text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {profit >= 0 ? '+' : ''}₹{(profit / 1000).toFixed(0)}K
              </p>
            </div>
          )}
          <ChevronRight size={18} className="text-blue-400" />
        </div>
      </div>

      {/* Desktop row layout */}
      <div className="hidden sm:flex items-center gap-4 lg:gap-6 px-4 lg:px-6 py-4">
        <div className="w-20 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
          {(car.images?.[0] || car.repairImages?.[0]) ? (
            <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Car size={20} className="text-slate-300" /></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-900 font-bold truncate">
              {car.brand} <span className="font-medium text-slate-500">{car.model}</span>
            </p>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">{car.year}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-500">
            <span className="font-medium">{car.registrationNumber}</span>
            <span className="text-slate-300 hidden md:inline">·</span>
            <span>{car.fuelType}</span>
            <span className="text-slate-300 hidden md:inline">·</span>
            <span>{car.ownerType} Owner</span>
          </div>
          {isAdmin && purchaserName && (
            <p className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
              <User size={11} className="text-blue-500 shrink-0" />
              <span className="text-slate-400">By</span>
              <span className="text-slate-700 font-semibold">{purchaserName}</span>
            </p>
          )}
          {isAdmin && sellerCustomer?.name && (
            <p className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
              <User size={11} className="text-violet-500 shrink-0" />
              <span className="text-slate-400">Seller</span>
              <span className="text-slate-700 font-semibold">{sellerCustomer.name}</span>
            </p>
          )}
        </div>

        <StatusBadge status={car.status} />

        <div className="text-right w-28 hidden md:block shrink-0">
          <p className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">Investment</p>
          <p className="text-slate-900 font-bold text-sm">₹{(totalCost / 100000).toFixed(2)}L</p>
        </div>

        {profit !== null && (
          <div className="text-right w-24 hidden lg:block shrink-0">
            <p className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">P&L</p>
            <p className={`font-bold text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {profit >= 0 ? '+' : ''}₹{(profit / 1000).toFixed(0)}K
            </p>
          </div>
        )}

        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
      </div>
    </div>
  );
});

export default function Inventory() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';
  const filteredCars = useSelector(selectFilteredCars);
  const allCars = useSelector((s) => s.cars.list);
  const { filterStatus, searchQuery, sortBy } = useSelector((s) => s.cars);

  const [showCarForm, setShowCarForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setSearchQuery(localSearch)), 250);
    return () => clearTimeout(t);
  }, [localSearch, dispatch]);

  const handleFilter = useCallback((v) => dispatch(setFilterStatus(v)), [dispatch]);
  const handleSort = useCallback((v) => dispatch(setSortBy(v)), [dispatch]);

  const canAddCar = user?.role === 'admin' || user?.role === 'purchase';

  const quickStats = [
    { label: 'Total', count: allCars.length, color: 'from-blue-500 to-indigo-500' },
    { label: 'Active', count: allCars.filter((c) => !['sold', 'sale_pending'].includes(c.status)).length, color: 'from-emerald-500 to-teal-500' },
    { label: 'Sold', count: allCars.filter((c) => c.status === 'sold').length, color: 'from-violet-500 to-purple-500' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 sm:p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-xs sm:text-sm font-medium">Vehicle Stock</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-0.5">Showroom Inventory</h2>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-1">
              <span className="font-bold text-white">{filteredCars.length}</span> vehicles match your filters
            </p>
          </div>
          {canAddCar && (
            <Button
              variant="surface"
              className="rounded-xl text-blue-600 hover:bg-blue-50 h-11 px-5 w-full sm:w-auto font-semibold"
              leftIcon={<Plus size={18} className="text-blue-600" />}
              onClick={() => setShowCarForm(true)}
            >
              Add Vehicle
            </Button>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
          {quickStats.map(({ label, count, color }) => (
            <div key={label} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center border border-white/10">
              <p className="text-blue-100 text-[10px] sm:text-xs font-medium">{label}</p>
              <p className="text-white font-bold text-lg sm:text-xl mt-0.5">{count}</p>
              <div className={`h-0.5 w-8 mx-auto mt-1.5 rounded-full bg-gradient-to-r ${color}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 space-y-4">
          {/* Search + sort + view */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search brand, model, reg no..."
                className="w-full pl-10 pr-4 h-11 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 h-11 rounded-xl flex-1 sm:flex-none sm:min-w-[150px]">
                <ArrowUpDown size={15} className="text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none w-full"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl h-11 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters — horizontal scroll on mobile */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Filter size={14} className="text-blue-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter by status</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
              {STATUS_FILTERS.map(({ label, value, color }) => {
                const active = filterStatus === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleFilter(value)}
                    className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? `${color} text-white shadow-md`
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-2xl border border-slate-100 shadow-sm px-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Car size={36} className="text-blue-300" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No vehicles found</h3>
            <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
              Try adjusting your search or filter criteria.
            </p>
            <button
              type="button"
              onClick={() => { setLocalSearch(''); handleFilter('all'); }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredCars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 hidden sm:block">
              <p className="text-xs font-semibold text-slate-500">
                {filteredCars.length} vehicle{filteredCars.length !== 1 ? 's' : ''} in list view
              </p>
            </div>
            <div>
              {filteredCars.map((car) => (
                <InventoryListRow key={car._id} car={car} isAdmin={isAdmin} />
              ))}
            </div>
          </div>
        )}

      <CarForm isOpen={showCarForm} onClose={() => setShowCarForm(false)} />
    </div>
  );
}
