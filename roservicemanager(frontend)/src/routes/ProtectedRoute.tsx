import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@/hooks/AuthContext";

/**
 * REACT CONCEPT: "wrapper" component for route guarding.
 * This component doesn't render its own UI - it decides WHICH UI to render
 * based on auth state:
 *   - still checking token validity -> spinner
 *   - not logged in -> redirect to /login (and remember where we came from)
 *   - logged in -> render the actual page (`children`)
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
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

  return <>{children}</>;
}
