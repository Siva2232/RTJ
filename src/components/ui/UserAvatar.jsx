import { getImageUrl } from '../../utils/helper';

const ROLE_GRADIENT = {
  admin: 'from-blue-500 to-indigo-600',
  purchase: 'from-amber-500 to-orange-500',
  sales: 'from-emerald-500 to-teal-500',
};

const SIZES = {
  xs: 'w-8 h-8 text-xs rounded-xl',
  sm: 'w-9 h-9 text-sm rounded-xl',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-14 h-14 text-lg rounded-2xl',
  xl: 'w-24 h-24 text-3xl rounded-2xl',
  '2xl': 'w-32 h-32 text-4xl rounded-3xl',
};

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizeClass = SIZES[size] || SIZES.md;
  const gradient = ROLE_GRADIENT[user?.role] || ROLE_GRADIENT.admin;
  const initial = user?.name?.[0]?.toUpperCase() || 'U';
  const src = getImageUrl(user?.profilePicture);

  if (src) {
    return (
      <img
        src={src}
        alt={user?.name || 'Profile'}
        className={`${sizeClass} object-cover shrink-0 ring-2 ring-white/20 shadow-md ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 shadow-md ring-2 ring-white/20 ${className}`}
    >
      {initial}
    </div>
  );
}
