import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "@/api/authApi";
import { tokenStorage } from "@/utils/tokenStorage";
import type { CurrentUser } from "@/types/auth";

/**
 * REACT CONCEPT: Context + Provider.
 * React state normally only flows "down" from parent to child via props.
 * Context lets us put a value (here: the logged-in user + auth actions)
 * into a "box" at the top of the component tree that ANY descendant can
 * read from, without threading it through props at every level.
 *
 * Three pieces:
 * 1. `createContext` -> creates the box, with a default value used only if
 *    no Provider is found above the component reading it.
 * 2. `<AuthProvider>` -> the component that actually holds the real state
 *    and renders `<AuthContext.Provider value={...}>` around its children.
 * 3. `useAuth()` -> a custom hook that reads the box's current value.
 */
interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // REACT CONCEPT: useState.
  // Returns a [currentValue, setterFunction] pair. Calling the setter causes
  // this component (and everything below it that reads the state) to
  // re-render with the new value. State set this way survives re-renders,
  // unlike a plain `let` variable which would reset every render.
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      // Token is invalid/expired - clear it and treat the user as logged out.
      tokenStorage.clearToken();
      setUser(null);
    }
  }, []);

  // REACT CONCEPT: useEffect.
  // Runs side effects (things outside of rendering, like API calls) after
  // the component mounts. The dependency array `[]` at the end means "run
  // this exactly once, when the component first mounts" - not on every
  // re-render.
  useEffect(() => {
    const existingToken = tokenStorage.getToken();
    if (!existingToken) {
      setIsInitializing(false);
      return;
    }
    fetchCurrentUser().finally(() => setIsInitializing(false));
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (token: string) => {
      tokenStorage.setToken(token);
      await fetchCurrentUser();
    },
    [fetchCurrentUser]
  );

  const logout = useCallback(() => {
    tokenStorage.clearToken();
    setUser(null);
  }, []);

  // REACT CONCEPT: useMemo.
  // Recomputes the wrapped value only when one of its dependencies changes,
  // instead of on every render. Here it avoids creating a brand-new context
  // value object (and re-rendering every consumer) on renders that don't
  // actually change auth state.
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      logout,
    }),
    [user, isInitializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
