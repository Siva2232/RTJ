import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeamManagement from "./pages/TeamManagement";
import PurchaseDashboard from "./pages/PurchaseDashboard";
import SalesDashboard from "./pages/SalesDashboard";
import Inventory from "./pages/Inventory";
import CarDetailsPage from "./pages/CarDetailsPage";
import Reports from "./pages/Reports";
import ProfilePage from "./pages/ProfilePage";

const ROLE_HOME = { admin: "/admin", purchase: "/purchase", sales: "/sales" };

function RoleRedirect() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user?.role] || "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Single layout — sidebar/navbar stay mounted across all pages */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "purchase", "sales"]} />}>
        <Route element={<DashboardLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["purchase", "admin"]} />}>
            <Route path="/purchase" element={<PurchaseDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["sales", "admin"]} />}>
            <Route path="/sales" element={<SalesDashboard />} />
          </Route>

          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<CarDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
