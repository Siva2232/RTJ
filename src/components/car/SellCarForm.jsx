import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { sellCarThunk } from '../../store/slices/carSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { Upload, X, FileText, CreditCard } from 'lucide-react';

const defaultForm = {
  sellingPrice: '',
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  aadharNumber: '',
  panNumber: '',
  bankAccountHolder: '',
  bankAccountNumber: '',
  bankName: '',
  bankIfsc: '',
};

function DocUpload({ label, required, file, preview, onChange, onClear, accept = 'image/jpeg,image/png,image/webp,application/pdf' }) {
  const inputRef = useRef(null);
  const isPdf = file?.type === 'application/pdf';

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-xl py-4 flex flex-col items-center gap-1.5 hover:bg-slate-50 transition-colors"
        >
          <Upload size={18} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Upload image or PDF</span>
        </button>
      ) : (
        <div className="relative flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
            {isPdf ? (
              <FileText size={18} className="text-red-500" />
            ) : preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <FileText size={18} className="text-slate-400" />
            )}
          </div>
          <p className="text-xs font-medium text-slate-700 truncate flex-1">{file.name}</p>
          <button type="button" onClick={onClear} className="p-1 text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" className="hidden" accept={accept} onChange={onChange} />
    </div>
  );
}

export default function SellCarForm({ isOpen, onClose, car }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(defaultForm);
  const [aadharDoc, setAadharDoc] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [panDoc, setPanDoc] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [rcBooks, setRcBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pickFile = (file, setFile, setPreview) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setFile(file);
    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  };

  const clearFile = (setFile, setPreview, preview) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const handleRcAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const valid = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is too large`);
        return false;
      }
      return true;
    });
    if (rcBooks.length + valid.length > 5) {
      toast.error('Maximum 5 RC book files');
      return;
    }
    setRcBooks((prev) => [
      ...prev,
      ...valid.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      })),
    ]);
    e.target.value = '';
  };

  const resetAll = () => {
    setForm(defaultForm);
    if (aadharPreview) URL.revokeObjectURL(aadharPreview);
    if (panPreview) URL.revokeObjectURL(panPreview);
    rcBooks.forEach((r) => r.preview && URL.revokeObjectURL(r.preview));
    setAadharDoc(null);
    setAadharPreview(null);
    setPanDoc(null);
    setPanPreview(null);
    setRcBooks([]);
    setLoading(false);
  };

  const handleClose = () => {
    resetAll();
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
    if (!/^\d{12}$/.test(form.aadharNumber)) {
      toast.error('Aadhar must be 12 digits');
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(form.panNumber)) {
      toast.error('Enter a valid PAN (e.g. ABCDE1234F)');
      return;
    }
    if (!form.bankAccountHolder || !form.bankAccountNumber || !form.bankName || !form.bankIfsc) {
      toast.error('All bank account fields are required');
      return;
    }
    if (!aadharDoc || !panDoc || rcBooks.length === 0) {
      toast.error('Aadhar, PAN and RC book documents are required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    formData.append('aadharDoc', aadharDoc);
    formData.append('panDoc', panDoc);
    rcBooks.forEach((r) => formData.append('rcBooks', r.file));

    const result = await dispatch(sellCarThunk({ carId: car._id, formData }));
    setLoading(false);

    if (sellCarThunk.fulfilled.match(result)) {
      toast.success('Sale request sent for admin approval');
      resetAll();
      onClose();
    } else {
      toast.error(result.payload || 'Failed to submit sale');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sell Car" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
          <span className="font-medium text-slate-900">{car?.brand} {car?.model}</span>
          {' — '}{car?.registrationNumber}
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

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-sm font-bold text-slate-800">Customer Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input name="customerName" value={form.customerName} onChange={handleChange} required placeholder="Customer name" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone <span className="text-red-500">*</span></label>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} required maxLength={10} placeholder="10-digit number" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Aadhar Number <span className="text-red-500">*</span></label>
              <input name="aadharNumber" value={form.aadharNumber} onChange={handleChange} required maxLength={12} placeholder="12-digit Aadhar" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">PAN Number <span className="text-red-500">*</span></label>
              <input name="panNumber" value={form.panNumber} onChange={handleChange} required maxLength={10} placeholder="ABCDE1234F" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl uppercase" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
              <input name="customerAddress" value={form.customerAddress} onChange={handleChange} placeholder="City, State" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <CreditCard size={16} className="text-blue-600" /> Bank Account Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Account Holder <span className="text-red-500">*</span></label>
              <input name="bankAccountHolder" value={form.bankAccountHolder} onChange={handleChange} required className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Account Number <span className="text-red-500">*</span></label>
              <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} required className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bank Name <span className="text-red-500">*</span></label>
              <input name="bankName" value={form.bankName} onChange={handleChange} required className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">IFSC Code <span className="text-red-500">*</span></label>
              <input name="bankIfsc" value={form.bankIfsc} onChange={handleChange} required placeholder="e.g. SBIN0001234" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl uppercase" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-sm font-bold text-slate-800">Documents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DocUpload
              label="Aadhar Card"
              required
              file={aadharDoc}
              preview={aadharPreview}
              onChange={(e) => pickFile(e.target.files?.[0], setAadharDoc, setAadharPreview)}
              onClear={() => clearFile(setAadharDoc, setAadharPreview, aadharPreview)}
            />
            <DocUpload
              label="PAN Card"
              required
              file={panDoc}
              preview={panPreview}
              onChange={(e) => pickFile(e.target.files?.[0], setPanDoc, setPanPreview)}
              onClear={() => clearFile(setPanDoc, setPanPreview, panPreview)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">RC Book <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(up to 5 files)</span></label>
            {rcBooks.length > 0 && (
              <div className="space-y-2 mb-2">
                {rcBooks.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded bg-white border flex items-center justify-center overflow-hidden">
                      {r.preview ? <img src={r.preview} alt="" className="w-full h-full object-cover" /> : <FileText size={14} className="text-red-500" />}
                    </div>
                    <span className="text-xs truncate flex-1">{r.file.name}</span>
                    <button type="button" onClick={() => setRcBooks((prev) => prev.filter((x) => x.id !== r.id))} className="text-red-400"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <label className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-500">
              <Upload size={16} /> Add RC Book files
              <input type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleRcAdd} />
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white/90 backdrop-blur-sm -mx-1 px-1 pb-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="success" className="flex-1" loading={loading}>Submit Sale Request</Button>
        </div>
      </form>
    </Modal>
  );
}
