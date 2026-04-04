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
  ShoppingBag 
} from 'lucide-react';
import { fetchUsersThunk, registerUserThunk, updateUserThunk } from '../../store/slices/authSlice';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  sales: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  purchase: 'bg-amber-100 text-amber-700 border-amber-200'
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
        password: '' // Don't show password
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
      // Update existing
      res = await dispatch(updateUserThunk({ 
        id: editingUser._id, 
        name: form.name, 
        role: form.role 
      }));
    } else {
      // Register new
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-slate-900 text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" size={20} />
            Team Management
          </h3>
          <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-wider">Configure access for sales & purchase teams</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-2 px-6"
        >
          <UserPlus size={18} />
          Add Team Member
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', count: users.length, icon: Users, color: 'text-slate-600 bg-slate-100' },
          { label: 'Active', count: users.filter(u => u.isActive).length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Sales Team', count: users.filter(u => u.role === 'sales').length, icon: Target, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Purchase', count: users.filter(u => u.role === 'purchase').length, icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 leading-none">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm outline-none font-medium"
        />
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role & Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-100">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-sm tracking-tight">{user.name}</p>
                        <p className="text-slate-400 text-xs font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border w-fit ${ROLE_COLORS[user.role]}`}>
                        <Shield size={10} className="mr-1.5" />
                        {ROLE_LABELS[user.role]}
                      </span>
                      <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${user.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {user.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {user.isActive ? 'Authorized' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                        title="Edit Member"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`p-2 rounded-xl transition-all shadow-sm border border-transparent ${
                          user.isActive 
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100' 
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                        }`}
                        title={user.isActive ? 'Suspend Access' : 'Restore Access'}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <Users size={24} />
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No team members found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Configure Member" : "New Team Member"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-2 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Display Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Jaison"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  required
                  type="email"
                  disabled={!!editingUser}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jaison@company.com"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-slate-800 transition-all ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {!editingUser && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Access Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Assigned Role</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'sales', label: 'Sales Team', icon: Target },
                  { id: 'purchase', label: 'Purchase Team', icon: ShoppingBag }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.id })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group ${
                      form.role === role.id 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <role.icon size={18} className={form.role === role.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'} />
                    <span className="text-xs font-black uppercase tracking-tight">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              loading={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 text-sm font-black uppercase tracking-[0.1em]"
            >
              {editingUser ? "Update Access" : "Launch Credentials"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}