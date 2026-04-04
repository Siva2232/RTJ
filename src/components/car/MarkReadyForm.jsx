import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { markReadyThunk } from '../../store/slices/carSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Camera, Plus, X, Receipt, IndianRupee, ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarkReadyForm({ isOpen, onClose, car }) {
  const dispatch = useDispatch();

  const [carImageFile, setCarImageFile] = useState(null);
  const [carImagePreview, setCarImagePreview] = useState(null);
  const [bills, setBills] = useState([]); // [{ id, file, name, preview }]
  const [repairTotal, setRepairTotal] = useState('');
  const [loading, setLoading] = useState(false);

  const carImgRef = useRef(null);
  const billInputRef = useRef(null);

  const resetForm = () => {
    setCarImageFile(null);
    setCarImagePreview(null);
    setBills([]);
    setRepairTotal('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCarImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setCarImageFile(file);
    setCarImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleBillAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newBills = files.map((file) => ({
      id: `bill-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setBills((prev) => [...prev, ...newBills]);
    e.target.value = '';
  };

  const removeBill = (id) => setBills((prev) => prev.filter((b) => b.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (carImageFile) formData.append('carImage', carImageFile);
    bills.forEach((b) => formData.append('bills', b.file));
    if (repairTotal) formData.append('repairTotalAmount', repairTotal);

    const result = await dispatch(markReadyThunk({ carId: car._id, formData }));
    setLoading(false);
    if (markReadyThunk.fulfilled.match(result)) {
      toast.success(`${car.brand} ${car.model} marked as ready to sell!`);
      resetForm();
      onClose();
    } else {
      toast.error(result.payload || 'Failed to mark car ready');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mark as Ready to Sell" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Car badge */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Camera size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{car?.brand} {car?.model}</p>
            <p className="text-xs text-slate-500">{car?.registrationNumber} â€” confirm repair completion below</p>
          </div>
        </div>

        {/* â”€â”€ Car Image Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <ImageIcon size={15} className="text-slate-400" />
            Car Photo (after repair)
          </label>

          {carImagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video w-full">
              <img src={carImagePreview} alt="Car after repair" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setCarImagePreview(null); setCarImageFile(null); }}
                className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => carImgRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <Camera size={28} />
              <span className="text-sm font-medium">Click to upload car photo</span>
              <span className="text-xs">PNG, JPG, WEBP</span>
            </button>
          )}
          <input ref={carImgRef} type="file" accept="image/*" className="hidden" onChange={handleCarImageChange} />
        </div>

        {/* â”€â”€ Repair Bills Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Receipt size={15} className="text-slate-400" />
              Repair Bills
              {bills.length > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">{bills.length}</span>
              )}
            </label>
            <button
              type="button"
              onClick={() => billInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={13} />
              Add Bill
            </button>
          </div>

          <input ref={billInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleBillAdd} />

          {bills.length === 0 ? (
            <button
              type="button"
              onClick={() => billInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <Receipt size={24} />
              <span className="text-sm font-medium">No bills added yet â€” click to upload</span>
              <span className="text-xs">Images or PDF files</span>
            </button>
          ) : (
            <div className="space-y-2">
              {bills.map((bill) => (
                <div key={bill.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                    {bill.preview ? (
                      <img src={bill.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Receipt size={18} className="text-slate-400" />
                    )}
                  </div>
                  <p className="flex-1 text-xs text-slate-600 font-medium truncate">{bill.name}</p>
                  <button
                    type="button"
                    onClick={() => removeBill(bill.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => billInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 border border-dashed border-slate-200 hover:border-blue-300 rounded-xl py-2.5 transition-colors"
              >
                <Plus size={13} />
                Add another bill
              </button>
            </div>
          )}
        </div>

        {/* â”€â”€ Repair Total Amount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <IndianRupee size={15} className="text-slate-400" />
            Total Repair Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
            <input
              type="number"
              value={repairTotal}
              onChange={(e) => setRepairTotal(e.target.value)}
              placeholder="e.g. 35000"
              min="0"
              className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Summary of all repair work done on this car</p>
        </div>

        {/* â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>
            Mark as Ready âœ“
          </Button>
        </div>
      </form>
    </Modal>
  );
}
