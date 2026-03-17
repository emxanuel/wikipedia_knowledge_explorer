'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LoginPayload, User } from "../lib/auth";
import {
  authGetCurrentUser,
  authLogin,
  authLogout,
} from "../features/auth/services";
import { setAuthErrorHandler } from "../features/services/httpClient";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const current = await authGetCurrentUser();
      setUser(current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      await authLogin(payload);
      await loadUser();
    },
    [loadUser],
  );

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  const handleAuthError = useCallback(() => {
    setUser(null);
    const redirect = encodeURIComponent(pathname ?? "/");
    router.replace(`/login?redirect=${redirect}`);
  }, [pathname, router]);

  useEffect(() => {
    setAuthErrorHandler(handleAuthError);
  }, [handleAuthError]);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

