import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@/hooks/AuthContext";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** If provided, only these roles may view the route - anyone else is sent to /dashboard. */
  allowedRoles?: UserRole[];
}

/**
 * REACT CONCEPT: "wrapper" component for route guarding.
 * This component doesn't render its own UI - it decides WHICH UI to render
 * based on auth state:
 *   - still checking token validity -> spinner
 *   - not logged in -> redirect to /login (and remember where we came from)
 *   - logged in but role isn't allowed for this route -> redirect to /dashboard
 *   - logged in and allowed -> render the actual page (`children`)
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
