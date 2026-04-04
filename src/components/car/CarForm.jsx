import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { createCarThunk } from "../../store/slices/carSlice";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { Upload, X, Image as ImageIcon, Plus, DollarSign } from "lucide-react";

const BRANDS = ["Maruti Suzuki", "Hyundai", "Honda", "Toyota", "Tata", "Mahindra", "Kia", "Volkswagen", "Skoda", "Ford", "Renault", "Nissan", "MG", "Jeep", "Other"];
const FUEL_TYPES = ["petrol", "diesel", "electric", "cng", "hybrid"];
const OWNER_TYPES = ["1st", "2nd", "3rd", "4th+"];
const PAYMENT_MODES = [
  { label: "Cash", value: "cash" },
  { label: "GPay", value: "gpay" },
  { label: "NEFT", value: "neft" },
  { label: "Other", value: "other" }
];

const defaultForm = {
  brand: "", model: "", year: new Date().getFullYear(), chassisNumber: "", registrationNumber: "",
  ownerType: "1st", fuelType: "petrol", mileage: "", purchasePrice: "",
  paymentMode: "cash", utrNumber: "",
  paymentDate: new Date().toISOString().split('T')[0],
  paymentDescription: "",
};

export default function CarForm({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [purchaseExpenses, setPurchaseExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 35) {
      toast.error("Maximum 35 images allowed");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (>5MB)`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleAddExpense = () => {
    setPurchaseExpenses(prev => [...prev, { title: "", amount: "", bill: null, billPreview: null }]);
  };

  const removeExpense = (index) => {
    setPurchaseExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpenseChange = (index, field, value) => {
    const updated = [...purchaseExpenses];
    updated[index][field] = value;
    setPurchaseExpenses(updated);
  };

  const handleBillUpload = (index, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Bill size must be < 2MB");
      return;
    }
    const updated = [...purchaseExpenses];
    updated[index].bill = file;
    updated[index].billPreview = URL.createObjectURL(file);
    setPurchaseExpenses(updated);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.registrationNumber || !form.purchasePrice) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });
    
    images.forEach(image => {
      formData.append("images", image);
    });

    // Purchase Expenses
    const expensesMeta = purchaseExpenses.map(exp => ({
      title: exp.title,
      amount: exp.amount,
      bill: !!exp.bill
    }));
    formData.append("purchaseExpenses", JSON.stringify(expensesMeta));

    purchaseExpenses.forEach((exp) => {
      if (exp.bill) {
        formData.append("expenseBills", exp.bill);
      }
    });

    const result = await dispatch(createCarThunk(formData));
    setLoading(true);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Car added to inventory!");
      setForm(defaultForm);
      setImages([]);
      setPreviews([]);
      setPurchaseExpenses([]);
      onClose();
    } else {
      toast.error(result.payload || "Failed to add car");
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Car" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand <span className="text-red-500">*</span></label>
            <select name="brand" value={form.brand} onChange={handleChange} required className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl">
              <option value="">Select Brand</option>
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model <span className="text-red-500">*</span></label>
            <input name="model" value={form.model} onChange={handleChange} required placeholder="e.g. Swift VXI" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange} min="1990" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
            <select name="fuelType" value={form.fuelType} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl">
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kilometers Run (KM)</label>
            <input name="mileage" type="number" value={form.mileage} onChange={handleChange} placeholder="e.g. 45000" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Registration No. <span className="text-red-500">*</span></label>
            <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required placeholder="e.g. KA01AB1234" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Owner Type</label>
            <select name="ownerType" value={form.ownerType} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl">
              {OWNER_TYPES.map((o) => <option key={o} value={o}>{o} Owner</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (₹) <span className="text-red-500">*</span></label>
            <input name="purchasePrice" type="number" value={form.purchasePrice} onChange={handleChange} required placeholder="e.g. 450000" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
            <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl">
              {PAYMENT_MODES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">UTR Number (GPay/NEFT)</label>
            <input name="utrNumber" value={form.utrNumber} onChange={handleChange} placeholder="e.g. 123456789012" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
            <input name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Description (Optional)</label>
          <input name="paymentDescription" value={form.paymentDescription} onChange={handleChange} placeholder="e.g. Paid to dealer directly" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Chassis No.</label>
          <input name="chassisNumber" value={form.chassisNumber} onChange={handleChange} placeholder="e.g. MA3FJEB1S00123456" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <DollarSign size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Purchase Expenses</h3>
            </div>
            <button type="button" onClick={handleAddExpense} className="p-1 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 shadow-sm">
              <Plus size={14} /> Add Line Item
            </button>
          </div>
          {purchaseExpenses.length > 0 ? (
            <div className="space-y-3">
              {purchaseExpenses.map((exp, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 flex flex-wrap sm:flex-nowrap gap-3 items-end group">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Title</label>
                    <input value={exp.title} onChange={(e) => handleExpenseChange(idx, "title", e.target.value)} placeholder="e.g. Parts, Cleaning" className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg" />
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Amount</label>
                    <input type="number" value={exp.amount} onChange={(e) => handleExpenseChange(idx, "amount", e.target.value)} placeholder="?" className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative group/bill">
                      <input type="file" id={`bill-${idx}`} className="hidden" onChange={(e) => handleBillUpload(idx, e.target.files[0])} accept="image/*" />
                      <label htmlFor={`bill-${idx}`} className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 border-dashed transition-all cursor-pointer ${exp.bill ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        {exp.billPreview ? <img src={exp.billPreview} className="w-full h-full object-cover rounded" /> : <Upload size={16} />}
                      </label>
                    </div>
                    <button type="button" onClick={() => removeExpense(idx)} className="p-2 text-slate-300 hover:text-red-500"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 text-xs py-2 italic font-medium">No initial purchase expenses added</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Car Images (Max 35)</label>
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Upload size={24} /></div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Click to upload car photos</p>
              <p className="text-xs text-slate-400 mt-1">Up to 35 high-quality images</p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*" />
          </div>
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
              {previews.map((src, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 opacity-0 group-hover:opacity-100"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-2 px-2 pb-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading} className="px-10">Add Car to Inventory</Button>
        </div>
      </form>
    </Modal>
  );
}
