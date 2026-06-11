import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { fetchCars } from '../store/slices/carSlice';
import { fetchNotifications } from '../store/slices/notificationSlice';

const PAGE_TITLES = {
  '/admin': 'Admin Dashboard',
  '/purchase': 'Purchase Dashboard',
  '/sales': 'Sales Dashboard',
  '/inventory': 'Inventory',
  '/reports': 'Reports',
  '/team': 'Team Management',
  '/profile': 'My Profile',
};

export default function DashboardLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';
  const isCarDetail = location.pathname.startsWith('/inventory/');
  const pageTitle = isCarDetail ? 'Car Details' : title;

  // Single bootstrap — avoids duplicate API calls on every page navigation
  useEffect(() => {
    dispatch(fetchCars());
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications({ force: true }));
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={pageTitle} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
