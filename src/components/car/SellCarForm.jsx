import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sellCarThunk } from '../../store/slices/carSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function SellCarForm({ isOpen, onClose, car }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    sellingPrice: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm({ sellingPrice: '', customerName: '', customerPhone: '', customerAddress: '' });
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sellingPrice || !form.customerName || !form.customerPhone) {
      toast.error('Selling price and customer details are required');
      return;
    }
    if (!/^\d{10}$/.test(form.customerPhone)) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    const result = await dispatch(
      sellCarThunk({
        carId: car._id,
        sellingPrice: Number(form.sellingPrice),
        customerDetails: {
          name: form.customerName,
          phone: form.customerPhone,
          address: form.customerAddress,
        },
      })
    );
    setLoading(false);
    if (sellCarThunk.fulfilled.match(result)) {
      toast.success(`${car.brand} ${car.model} sold successfully!`);
      handleClose();
    } else {
      toast.error(result.payload || 'Failed to sell car');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sell Car" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
          <span className="font-medium text-slate-900">{car?.brand} {car?.model}</span> â€” {car?.registrationNumber}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹) <span className="text-red-500">*</span></label>
          <input
            name="sellingPrice"
            type="number"
            value={form.sellingPrice}
            onChange={handleChange}
            required
            placeholder="e.g. 550000"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Customer Details</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
                placeholder="Customer name"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone <span className="text-red-500">*</span></label>
              <input
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleChange}
                required
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
              <input
                name="customerAddress"
                value={form.customerAddress}
                onChange={handleChange}
                placeholder="City, State"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="success" className="flex-1" loading={loading}>Confirm Sale</Button>
        </div>
      </form>
    </Modal>
  );
}
