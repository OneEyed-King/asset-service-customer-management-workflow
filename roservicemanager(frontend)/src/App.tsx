import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "sonner";
import { theme } from "@/theme/theme";
import { AuthProvider } from "@/hooks/AuthContext";
import { AppRoutes } from "@/routes/AppRoutes";

/**
 * REACT CONCEPT: "provider stack".
 * Several libraries (React Query, MUI's theme, our own auth context) work
 * via the Context mechanism described in AuthContext.tsx. Each one needs
 * its Provider component wrapped around the part of the tree that should
 * have access to it. Since we want ALL pages to have access to all of
 * them, we nest them all here, once, at the root of the app.
 *
 * QueryClient is TanStack Query's cache + request manager - one instance
 * is created per app and shared via QueryClientProvider.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
