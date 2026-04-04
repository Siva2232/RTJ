import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Plus, Car, LayoutGrid, List } from 'lucide-react';
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
import { StatusBadge, ProfitBadge } from '../components/ui/Badge';

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Purchased', value: 'purchased' },
  { label: 'In Repair', value: 'repair' },
  { label: 'Ready', value: 'ready' },
  { label: 'Sale Pending', value: 'sale_pending' },
  { label: 'Sold', value: 'sold' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'date' },
  { label: 'Highest Profit', value: 'profit' },
  { label: 'Highest Cost', value: 'cost' },
];

const InventoryListRow = memo(function InventoryListRow({ car }) {
  const navigate = useNavigate();
  const totalCost = calcTotalCost(car);
  const profit = car.status === 'sold' ? calcProfit(car) : null;

  return (
    <div
      onClick={() => navigate(`/inventory/${car._id}`)}
      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
    >
      <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
        {(car.images?.[0] || car.repairImages?.[0]) ? (
          <img src={getImageUrl(car.images?.[0] || car.repairImages?.[0])} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={16} className="text-slate-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 text-sm font-semibold truncate">
          {car.brand} {car.model} ({car.year})
        </p>
        <p className="text-slate-500 text-xs">
          {car.registrationNumber} · {car.ownerType} Owner · {car.fuelType}
        </p>
      </div>
      <StatusBadge status={car.status} />
      <div className="text-right hidden sm:block">
        <p className="text-slate-400 text-xs">Total Cost</p>
        <p className="text-slate-800 font-semibold text-sm">
          ₹{(totalCost / 100000).toFixed(2)}L
        </p>
      </div>
      {profit !== null && (
        <div className="text-right hidden md:block">
          <p className="text-slate-400 text-xs">Profit/Loss</p>
          <p className={`font-bold text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {profit >= 0 ? '+' : ''}₹{(profit / 1000).toFixed(0)}K
          </p>
        </div>
      )}
    </div>
  );
});

export default function Inventory() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const filteredCars = useSelector(selectFilteredCars);
  const { filterStatus, searchQuery, sortBy } = useSelector((s) => s.cars);

  const [showCarForm, setShowCarForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  // Local input state — debounced before dispatching to avoid lag on every keystroke
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-2xl font-bold">Inventory</h2>
          <p className="text-slate-500 text-sm mt-0.5">{filteredCars.length} cars found</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'purchase') && (
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCarForm(true)}>
            Add Car
          </Button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by model, brand, reg. no..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatus === value
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Car Grid / List */}
      {filteredCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
            <Car size={40} className="text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold">No cars found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {filteredCars.map((car) => (
            <InventoryListRow key={car._id} car={car} />
          ))}
        </div>
      )}

      <CarForm isOpen={showCarForm} onClose={() => setShowCarForm(false)} />
    </div>
  );
}
