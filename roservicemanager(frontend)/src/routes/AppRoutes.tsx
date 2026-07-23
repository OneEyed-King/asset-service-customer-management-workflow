import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import CustomersPage from "@/pages/CustomersPage";
import CustomerDetailsPage from "@/pages/CustomerDetailsPage";
import AssetsPage from "@/pages/AssetsPage";
import NotFoundPage from "@/pages/NotFoundPage";

/**
 * REACT CONCEPT: react-router-dom's <Routes>/<Route>.
 * This is the app's URL -> component map, similar to a Spring
 * @Controller's @GetMapping paths, but resolved entirely in the browser
 * (no server round-trip on navigation).
 *
 * Every authenticated route is wrapped twice:
 *   <ProtectedRoute>   - redirects to /login if not authenticated
 *     <DashboardLayout> - renders the permanent sidebar/topbar around the page
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CustomersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers/:customerId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CustomerDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AssetsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
