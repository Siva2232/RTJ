import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the user's own dashboard
    const roleHome = { admin: '/admin', purchase: '/purchase', sales: '/sales' };
    return <Navigate to={roleHome[user?.role] || '/login'} replace />;
  }

  return <Outlet />;
}
