import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  UserPlus, Users, Search, Mail, Shield, CheckCircle,
  Edit2, Power, User, Key, Target, ShoppingBag, ArrowRight,
} from 'lucide-react';
import { fetchUsersThunk, registerUserThunk, updateUserThunk } from '../../store/slices/authSlice';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import {
  DashboardBanner, BannerStatGrid, DashboardSection, EmptyState,
} from '../dashboard/DashboardUI';

const ROLE_COLORS = {
  admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  sales: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  purchase: 'bg-amber-100 text-amber-700 border-amber-200',
};

const ROLE_LABELS = {
  admin: 'Administrator',
  sales: 'Sales Team',
  purchase: 'Purchase Team',
};

const AVATAR_GRADIENT = {
  admin: 'from-indigo-500 to-violet-600',
  sales: 'from-emerald-500 to-teal-600',
  purchase: 'from-amber-500 to-orange-600',
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
    role: 'sales',
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
      setForm({ name: user.name, email: user.email, role: user.role, password: '' });
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
      res = await dispatch(updateUserThunk({ id: editingUser._id, name: form.name, role: form.role }));
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
    const res = await dispatch(updateUserThunk({ id: user._id, isActive: !user.isActive }));
    if (updateUserThunk.fulfilled.match(res)) {
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <DashboardBanner
        eyebrow="Administration"
        title="Team Management"
        description="Manage staff accounts, roles, and access permissions."
        gradient="from-indigo-600 via-violet-600 to-purple-600"
        shadow="shadow-indigo-500/15"
        action={
          <Button
            variant="surface"
            className="rounded-xl text-indigo-600 hover:bg-indigo-50 h-10 px-5 w-full sm:w-auto font-semibold shrink-0"
            leftIcon={<UserPlus size={18} className="text-indigo-600" />}
            onClick={() => handleOpenModal()}
          >
            Add Member
          </Button>
        }
      >
        <BannerStatGrid
          items={[
            { label: 'Total Staff', value: users.length, icon: Users, gradient: 'from-slate-300 to-slate-400' },
            { label: 'Active', value: users.filter((u) => u.isActive).length, icon: CheckCircle, gradient: 'from-emerald-300 to-teal-400' },
            { label: 'Sales', value: users.filter((u) => u.role === 'sales').length, icon: Target, gradient: 'from-blue-300 to-indigo-400' },
            { label: 'Purchase', value: users.filter((u) => u.role === 'purchase').length, icon: ShoppingBag, gradient: 'from-amber-300 to-orange-400' },
          ]}
        />
      </DashboardBanner>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-11 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      <DashboardSection
        title="Team Members"
        subtitle="All registered accounts"
        count={filteredUsers.length}
        headerClass="bg-gradient-to-r from-indigo-50/80 to-violet-50/80"
        headerAccent="from-indigo-500 to-violet-500"
      >
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading team...</div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members found"
            subtitle="Try a different search or add a new team member."
            action={
              <Button variant="primary" className="rounded-xl" leftIcon={<UserPlus size={16} />} onClick={() => handleOpenModal()}>
                Add Member
              </Button>
            }
          />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {filteredUsers.map((user) => (
                <div key={user._id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENT[user.role] || AVATAR_GRADIENT.sales} flex items-center justify-center text-white font-bold`}>
                        {user.name[0].toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                      <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${ROLE_COLORS[user.role]}`}>
                        <Shield size={10} />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        user.isActive ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      <Power size={14} /> {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto -mx-1">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider border-b border-slate-100">
                    <th className="pb-3 px-2">Member</th>
                    <th className="pb-3 px-2">Role</th>
                    <th className="pb-3 px-2">Joined</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENT[user.role] || AVATAR_GRADIENT.sales} flex items-center justify-center text-white font-bold text-sm`}>
                            {user.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                            <p className="text-slate-500 text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${ROLE_COLORS[user.role]}`}>
                          <Shield size={10} />
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user)}
                            className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          >
                            <Power size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DashboardSection>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Update Member' : 'Add Team Member'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-2 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  type="email"
                  disabled={!!editingUser}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${editingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="john@company.com"
                />
              </div>
            </div>

            {!editingUser && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sales', label: 'Sales', icon: Target },
                  { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.id })}
                    className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left ${
                      form.role === role.id
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <role.icon size={18} className="mb-1.5" />
                    <span className="text-xs font-semibold">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} variant="primary" className="w-full rounded-xl py-3" rightIcon={!loading && <ArrowRight size={16} />}>
            {editingUser ? 'Save Changes' : 'Add Member'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
