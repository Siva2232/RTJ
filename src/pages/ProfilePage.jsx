import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  User, Mail, Shield, Camera, Lock, Save, CalendarDays, Upload, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchProfileThunk, updateProfileThunk } from '../store/slices/authSlice';
import { DashboardPage, DashboardBanner, DashboardSection } from '../components/dashboard/DashboardUI';
import UserAvatar from '../components/ui/UserAvatar';
import Button from '../components/ui/Button';
import { getImageUrl } from '../utils/helper';

const ROLE_LABELS = { admin: 'Administrator', purchase: 'Purchase Team', sales: 'Sales Team' };
const ROLE_BADGE = {
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  purchase: 'bg-amber-100 text-amber-700 border-amber-200',
  sales: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, profileUpdating } = useSelector((s) => s.auth);
  const fileRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (!user?.createdAt) dispatch(fetchProfileThunk());
  }, [dispatch, user?.createdAt]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelect = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP images allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB');
      return;
    }
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword && !currentPassword) {
      toast.error('Enter your current password to change it');
      return;
    }

    const formData = new FormData();
    if (name.trim() && name.trim() !== user?.name) formData.append('name', name.trim());
    if (photoFile) formData.append('profilePicture', photoFile);
    if (newPassword) {
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
    }

    if ([...formData.keys()].length === 0) {
      toast.error('No changes to save');
      return;
    }

    const result = await dispatch(updateProfileThunk(formData));
    if (updateProfileThunk.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
      clearPhoto();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  const displayPhoto = photoPreview || getImageUrl(user?.profilePicture);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <DashboardPage>
      <DashboardBanner
        eyebrow="Account"
        title="My Profile"
        description="Manage your personal info and profile photo"
        gradient="from-blue-600 via-indigo-600 to-violet-600"
        shadow="shadow-indigo-500/20"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Photo card */}
          <div className="lg:col-span-4">
            <DashboardSection title="Profile Photo" subtitle="JPG, PNG or WEBP · max 2 MB" headerAccent="from-violet-500 to-purple-500">
              <div className="flex flex-col items-center py-4">
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-indigo-500/15 bg-slate-100">
                    {displayPhoto ? (
                      <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserAvatar user={user} size="2xl" className="!w-full !h-full !rounded-none !ring-0" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform"
                    aria-label="Upload photo"
                  >
                    <Camera size={18} />
                  </button>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                />

                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Upload size={14} />}
                    onClick={() => fileRef.current?.click()}
                  >
                    Upload Photo
                  </Button>
                  {photoFile && (
                    <Button type="button" variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={clearPhoto}>
                      Cancel
                    </Button>
                  )}
                </div>

                {photoFile && (
                  <p className="text-xs text-emerald-600 font-medium mt-3 text-center">
                    New photo selected — save to apply
                  </p>
                )}
              </div>
            </DashboardSection>

            {/* Account info card */}
            <div className="mt-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="lg" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${ROLE_BADGE[user?.role] || ROLE_BADGE.admin}`}>
                  <Shield size={10} />
                  {ROLE_LABELS[user?.role] || user?.role}
                </span>
                {memberSince && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600">
                    <CalendarDays size={10} />
                    Since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="lg:col-span-8 space-y-4">
            <DashboardSection title="Personal Information" subtitle="Update your display name" headerAccent="from-blue-500 to-cyan-500">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={50}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-900 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed. Contact admin if needed.</p>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection
              title="Security"
              subtitle="Change your password"
              headerAccent="from-rose-500 to-orange-500"
              badge={
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {showPasswordSection ? 'Hide' : 'Change Password'}
                </button>
              }
            >
              {showPasswordSection ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all"
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all"
                        placeholder="Min 6 characters"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all"
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-2">
                  Click &quot;Change Password&quot; to update your login credentials.
                </p>
              )}
            </DashboardSection>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={profileUpdating}
                leftIcon={<Save size={18} />}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg shadow-blue-500/25"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </DashboardPage>
  );
}
