import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { User, DollarSign, Calendar, Phone, MapPin } from 'lucide-react';
import { formatINR } from '../../utils/helper';

export default function SaleApprovalModal({ isOpen, onClose, car, onConfirm, loading }) {
  if (!car) return null;

  const approval = car.saleApproval;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Sale Request" size="md">
      <div className="space-y-6">
        {/* Car Info */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Car Details</p>
          <h3 className="text-slate-900 font-bold text-lg">{car.brand} {car.model} ({car.year})</h3>
          <p className="text-slate-500 text-sm">{car.registrationNumber}</p>
          
          <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-xs">Requested Price</p>
              <p className="text-blue-600 font-bold text-xl">{formatINR(approval?.requestedPrice || 0)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Request Date</p>
              <p className="text-slate-700 font-medium text-sm">
                {approval?.requestedAt ? new Date(approval.requestedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-3">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider px-1">Customer Information</p>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <User size={16} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Name</p>
                <p className="text-slate-800 text-sm font-semibold">{approval?.customerDetails?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Phone</p>
                <p className="text-slate-800 text-sm font-semibold">{approval?.customerDetails?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Address</p>
                <p className="text-slate-800 text-sm font-semibold truncate max-w-[250px]">
                  {approval?.customerDetails?.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="danger" 
            className="flex-1 rounded-xl h-12" 
            onClick={() => onConfirm('reject')}
            loading={loading}
          >
            Reject Request
          </Button>
          <Button 
            variant="success" 
            className="flex-1 rounded-xl h-12" 
            onClick={() => onConfirm('approve')}
            loading={loading}
          >
            Approve Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
}
