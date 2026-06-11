import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateStatusThunk } from '../../store/slices/carSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Wrench, Car, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MoveToRepairModal({ isOpen, onClose, car }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLoading(false);
    onClose();
  };

  const handleConfirm = async () => {
    setLoading(true);
    const result = await dispatch(updateStatusThunk({ carId: car._id, status: 'repair' }));
    setLoading(false);

    if (updateStatusThunk.fulfilled.match(result)) {
      toast.success(`${car.brand} ${car.model} moved to repair`);
      handleClose();
    } else {
      toast.error(result.payload || 'Failed to update status');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Move to Repair" size="md">
      <div className="space-y-5">
        {/* Car info */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Car size={18} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {car?.brand} {car?.model}
            </p>
            <p className="text-xs text-slate-500">{car?.registrationNumber}</p>
          </div>
        </div>

        {/* Status flow visual */}
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-lg">
            Purchased
          </span>
          <ArrowRight size={16} className="text-slate-300" />
          <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500 text-white rounded-lg shadow-sm">
            Repair
          </span>
        </div>

        {/* Info */}
        <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            This vehicle will be moved to the <strong>repair stage</strong>. The sales team can then log refurbishment costs and mark it ready when work is complete.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1 !bg-amber-500 hover:!bg-amber-600"
            loading={loading}
            leftIcon={<Wrench size={16} />}
            onClick={handleConfirm}
          >
            Confirm Move to Repair
          </Button>
        </div>
      </div>
    </Modal>
  );
}
