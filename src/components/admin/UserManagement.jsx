import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  Search, 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  Edit2, 
  Power,
  X,
  User,
  Key,
  Target,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { fetchUsersThunk, registerUserThunk, updateUserThunk } from '../../store/slices/authSlice';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  sales: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  purchase: 'bg-amber-50 text-amber-700 border-amber-100'
};

const ROLE_LABELS = {
  admin: 'Administrator',
  sales: 'Sales Team',
  purchase: 'Purchase Team'
};

export default function UserManagement() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales'
  });

  useEffect(() => {
    loadUsers();
  }, [dispatch]);

  const loadUsers = async () => {
    setLoading(true);
    const res = await dispatch(fetchUsersThunk());
    if (fetchUsersThunk.fulfilled.match(res)) {
      setUsers(res.payload);
    }
    setLoading(false);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '' 
      });
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'sales' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let res;
    if (editingUser) {
      res = await dispatch(updateUserThunk({ 
        id: editingUser._id, 
        name: form.name, 
        role: form.role 
      }));
    } else {
      if (!form.password) {
        toast.error('Password is required for new users');
        setLoading(false);
        return;
      }
      res = await dispatch(registerUserThunk(form));
    }

    setLoading(false);
    if (registerUserThunk.fulfilled.match(res) || updateUserThunk.fulfilled.match(res)) {
      toast.success(editingUser ? 'User updated!' : 'New teammate added!');
      setIsModalOpen(false);
      loadUsers();
    } else {
      toast.error(res.payload || 'Action failed');
    }
  };

  const toggleUserStatus = async (user) => {
    const res = await dispatch(updateUserThunk({ 
      id: user._id, 
      isActive: !user.isActive 
    }));
    if (updateUserThunk.fulfilled.match(res)) {
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <Users className="text-white" size={24} />
            </div>
            <h3 className="text-slate-900 text-3xl font-black tracking-tight">
              Team Members
            </h3>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Manage your organization's workforce and permission levels
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 hover:bg-black text-white shadow-xl flex items-center gap-2 px-8 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
        >
          <UserPlus size={18} />
          <span className="font-bold tracking-wide">Add New Member</span>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Staff', count: users.length, icon: Users, color: 'text-slate-600 bg-slate-100' },
          { label: 'Active Access', count: users.filter(u => u.isActive).length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Sales Leads', count: users.filter(u => u.role === 'sales').length, icon: Target, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Inventory Mgrs', count: users.filter(u => u.role === 'purchase').length, icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.count}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Search teammates by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-base focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm outline-none font-medium placeholder:text-slate-400"
        />
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 backdrop-blur-sm">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role & Permissions</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Registration</th>
                <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white text-lg font-black shadow-inner">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-base tracking-tight">{user.name}</p>
                        <p className="text-slate-400 text-sm font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider border w-fit shadow-sm ${ROLE_COLORS[user.role]}`}>
                        <Shield size={12} className="mr-2" />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-500 text-sm font-semibold italic">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm active:scale-90"
                        title="Edit Settings"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`p-3 rounded-2xl transition-all border border-transparent shadow-sm active:scale-90 ${
                          user.isActive 
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100' 
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                        }`}
                        title={user.isActive ? 'Revoke Access' : 'Grant Access'}
                      >
                        <Power size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center bg-slate-50/30">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-200">
                <Users size={36} />
              </div>
              <h4 className="text-slate-900 font-bold text-lg">No Results Found</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Try adjusting your search filters to find the member you're looking for.</p>
            </div>
          )}
        </div>
      </div>

      {/* Improved Modal Content */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Update Permissions" : "Add New Teammate"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-8">
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
                <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
                        placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Email Workspace</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                        required
                        type="email"
                        disabled={!!editingUser}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all ${editingUser ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                        placeholder="john@company.com"
                        />
                    </div>
                </div>
            </div>

            {!editingUser && (
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2.5 ml-1">Secure Password</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Organization Role</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'sales', label: 'Sales Force', icon: Target, desc: 'Lead handling' },
                  { id: 'purchase', label: 'Inventory', icon: ShoppingBag, desc: 'Stock buying' }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.id })}
                    className={`flex flex-col items-start p-5 rounded-[1.5rem] border-2 transition-all text-left group ${
                      form.role === role.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <role.icon size={22} className={`mb-3 ${form.role === role.id ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs font-black uppercase tracking-tighter mb-1">{role.label}</span>
                    <span className={`text-[10px] ${form.role === role.id ? 'text-indigo-100' : 'text-slate-400'}`}>{role.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              loading={loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] shadow-2xl shadow-indigo-200 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <span>{editingUser ? "Save Configuration" : "Grant Access Now"}</span>
              {!loading && <ArrowRight size={18} />}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}