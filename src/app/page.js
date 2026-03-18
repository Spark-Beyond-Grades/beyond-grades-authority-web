"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

/**
 * Root page — redirects to dashboard if authenticated, login otherwise.
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-sm text-brand-muted animate-pulse">Loading...</div>
    </div>
  );
}