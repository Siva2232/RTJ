import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SaleCustomerDetailsPanel from './SaleCustomerDetailsPanel';
import { formatINR } from '../../utils/helper';

export default function SaleApprovalModal({ isOpen, onClose, car, onConfirm, loading, onViewDocument }) {
  if (!car) return null;

  const approval = car.saleApproval;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Sale Request" size="lg">
      <div className="space-y-5">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Vehicle</p>
          <h3 className="text-slate-900 font-bold text-lg">{car.brand} {car.model} ({car.year})</h3>
          <p className="text-slate-500 text-sm">{car.registrationNumber}</p>
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
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

        <SaleCustomerDetailsPanel
          variant="light"
          customer={approval?.customerDetails}
          soldBy={approval?.requestedBy}
          sellingPrice={approval?.requestedPrice}
          onViewDocument={onViewDocument}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="danger" className="flex-1 rounded-xl h-12" onClick={() => onConfirm('reject')} loading={loading}>
            Reject Request
          </Button>
          <Button variant="success" className="flex-1 rounded-xl h-12" onClick={() => onConfirm('approve')} loading={loading}>
            Approve Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
}
