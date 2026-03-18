"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext(null);

/**
 * Provides auth state (user, token, loading) to the entire app.
 *
 * - Listens to `onIdTokenChanged` so the token auto-refreshes before expiry.
 * - Exposes `getToken()` that always returns a fresh ID token.
 * - Exposes `logout()` to sign out and clear stored state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);
        localStorage.setItem("bg_id_token", idToken);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("bg_id_token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /** Always returns a fresh token (forces refresh if needed). */
  const getToken = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    const freshToken = await currentUser.getIdToken(/* forceRefresh */ true);
    setToken(freshToken);
    localStorage.setItem("bg_id_token", freshToken);
    return freshToken;
  }, []);

  /** Sign out from Firebase and clear local state. */
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    localStorage.removeItem("bg_id_token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, getToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state anywhere:
 *   const { user, token, loading, getToken, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
