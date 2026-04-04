import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Fuel, Calendar, Gauge, ArrowRight, IndianRupee, MapPin } from 'lucide-react';
import { StatusBadge, ProfitBadge } from '../ui/Badge';
import { calcTotalCost, calcProfit } from '../../store/slices/carSlice';
import { getImageUrl } from '../../utils/helper';

export default function CarCard({ car }) {
  const navigate = useNavigate();
  const totalCost = calcTotalCost(car);
  const profit = car.status === 'sold' ? calcProfit(car) : null;

  return (
    <motion.div
      whileHover={{ y: -6, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => navigate(`/inventory/${car._id}`)}
      className="group relative bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden cursor-pointer transition-all hover:border-blue-500/30"
    >
      {/* Top Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {(car.images?.[0] || car.repairImages?.[0]) ? (
          <img
            src={getImageUrl(car.images?.[0] || car.repairImages?.[0])}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50">
            <Car size={40} className="text-slate-200 mb-2" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Media</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="backdrop-blur-md bg-white/70 rounded-full px-1 py-1 pr-3 border border-white/20 shadow-sm">
            <StatusBadge status={car.status} />
          </div>
        </div>

        {car.status === 'sold' && profit !== null && (
          <div className="absolute top-4 right-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="backdrop-blur-md bg-emerald-500/90 rounded-2xl p-1 shadow-lg shadow-emerald-500/20"
            >
              <ProfitBadge profit={profit} />
            </motion.div>
          </div>
        )}
        
        {/* Registration Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
           <span className="text-white/90 text-[10px] font-black uppercase tracking-widest bg-black/20 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
             {car.registrationNumber}
           </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-slate-900 font-black text-base leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
              {car.brand} <span className="font-medium text-slate-600">{car.model}</span>
            </h3>
            <div className="flex items-center gap-1 text-slate-400 mt-1">
              <MapPin size={10} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Inventory Hub</span>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 mb-4">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
            <Calendar size={12} className="text-slate-400 mb-1" />
            <span className="text-[10px] font-black text-slate-700">{car.year}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
            <Fuel size={12} className="text-slate-400 mb-1" />
            <span className="text-[10px] font-black text-slate-700 truncate capitalize">{car.fuelType}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
            <Gauge size={12} className="text-slate-400 mb-1" />
            <span className="text-[10px] font-black text-slate-700">
              {car.mileage ? `${(car.mileage / 1000).toFixed(1)}k km` : '0k km'}
            </span>
          </div>
        </div>

        {/* Pricing Footer */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
              {car.status === 'sold' ? 'Investment' : 'Valuation'}
            </p>
            <div className="flex items-baseline gap-0.5">
              <IndianRupee size={12} className="text-slate-900" />
              <span className="text-slate-900 font-black text-lg">
                {(totalCost / 100000).toFixed(2)}<span className="text-xs ml-0.5">L</span>
              </span>
            </div>
          </div>

          <div className="relative">
            {car.status === 'sold' && car.sellingPrice ? (
              <div className="text-right">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em]">Realized</p>
                <p className="text-emerald-700 font-black text-lg">
                  ₹{(car.sellingPrice / 100000).toFixed(2)}L
                </p>
              </div>
            ) : (
              <motion.div 
                whileHover={{ x: 5 }}
                className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-all"
              >
                <ArrowRight size={18} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover Line Decoration */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-blue-600 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
}