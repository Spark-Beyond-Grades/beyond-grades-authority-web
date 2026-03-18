"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Wraps any page that requires authentication.
 * Shows a loading state while checking auth, redirects to /login if unauthenticated.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="text-sm text-brand-muted animate-pulse">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}
