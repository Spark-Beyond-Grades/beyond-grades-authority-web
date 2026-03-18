"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Top navigation bar for authenticated pages.
 * Shows the app name, user email, and logout button.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-base font-semibold text-brand-text hover:text-brand-primary transition-colors"
        >
          Beyond Grades
        </button>

        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-brand-muted hidden sm:block">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 bg-white text-sm font-medium text-brand-text px-3 py-1.5 hover:bg-slate-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
