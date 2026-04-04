import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Fuel, Calendar, Gauge, ArrowRight } from 'lucide-react';
import { StatusBadge, ProfitBadge } from '../ui/Badge';
import { calcTotalCost, calcProfit } from '../../store/slices/carSlice';
import { getImageUrl } from '../../utils/helper';

export default function CarCard({ car }) {
  const navigate = useNavigate();
  const totalCost = calcTotalCost(car);
  const profit = car.status === 'sold' ? calcProfit(car) : null;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/inventory/${car._id}`)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {(car.images?.[0] || car.repairImages?.[0]) ? (
          <img
            src={getImageUrl(car.images?.[0] || car.repairImages?.[0])}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Car size={48} className="text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge status={car.status} />
        </div>
        {car.status === 'sold' && profit !== null && (
          <div className="absolute top-3 right-3">
            <ProfitBadge profit={profit} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-slate-900 font-semibold text-sm leading-tight">
            {car.brand} {car.model}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">{car.registrationNumber}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar size={11} />
            <span className="text-xs">{car.year}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Fuel size={11} />
            <span className="text-xs truncate capitalize">{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Gauge size={11} />
            <span className="text-xs">{(car.km / 1000).toFixed(0)}k km</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-slate-400 text-xs">Total Cost</p>
            <p className="text-slate-900 font-bold text-sm">
              ₹{(totalCost / 100000).toFixed(2)}L
            </p>
          </div>
          {car.status === 'sold' && car.sellingPrice ? (
            <div className="text-right">
              <p className="text-slate-400 text-xs">Sold At</p>
              <p className="text-slate-900 font-bold text-sm">
                ₹{(car.sellingPrice / 100000).toFixed(2)}L
              </p>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowRight size={14} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
