import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addPurchaseExpenseThunk, addRepairCostThunk } from '../../store/slices/carSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { Upload, X, FileText, ExternalLink } from 'lucide-react';

const MAX_BILL_SIZE = 5 * 1024 * 1024;
const ACCEPTED_BILL_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export default function ExpenseForm({ isOpen, onClose, carId, type = 'purchase' }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ 
    title: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [billImage, setBillImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'image' | 'pdf'
  const [loading, setLoading] = useState(false);

  const modalTitle = type === 'purchase' ? 'Add Purchase Expense' : 'Add Repair / Maintenance Cost';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BILL_SIZE) {
      toast.error('File size should be less than 5MB');
      return;
    }
    if (!ACCEPTED_BILL_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP images and PDF files are allowed');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    const isPdf = file.type === 'application/pdf';
    setBillImage(file);
    setPreviewType(isPdf ? 'pdf' : 'image');
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setBillImage(null);
    setPreview(null);
    setPreviewType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      toast.error('Title and amount are required');
      return;
    }
    setLoading(true);

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('amount', form.amount);
    formData.append('date', form.date);
    if (billImage) {
      formData.append('billImage', billImage);
    }

    const thunk = type === 'purchase' ? addPurchaseExpenseThunk : addRepairCostThunk;
    const result = await dispatch(thunk({ carId, expense: formData }));
    
    setLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Expense added successfully');
      setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });
      removeFile();
      onClose();
    } else {
      toast.error(result.payload || 'Failed to add expense');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expense Title / Category <span className="text-red-500">*</span></label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. Fuel, Engine Oil, Documentation"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              required
              placeholder="0"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload Bill / Receipt</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          />
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Upload size={20} />
              </div>
              <p className="text-sm font-medium text-slate-600">Click to upload</p>
              <p className="text-xs text-slate-400">JPG, PNG, WEBP or PDF up to 5MB</p>
            </div>
          ) : previewType === 'pdf' ? (
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{billImage?.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">PDF document ready to upload</p>
                  <a
                    href={preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2"
                  >
                    <ExternalLink size={12} />
                    Preview PDF
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
              <img src={preview} alt="Bill preview" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading}>Add Expense</Button>
        </div>
      </form>
    </Modal>
  );
}

