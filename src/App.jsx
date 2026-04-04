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

const ROLE_HOME = { admin: "/admin", purchase: "/purchase", sales: "/sales" };

function RoleRedirect() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user?.role] || "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Role-based dashboards */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["purchase", "admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/purchase" element={<PurchaseDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["sales", "admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/sales" element={<SalesDashboard />} />
        </Route>
      </Route>

      {/* Inventory — all roles */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "purchase", "sales"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<CarDetailsPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}