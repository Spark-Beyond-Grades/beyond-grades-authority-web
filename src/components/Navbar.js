"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Glassmorphism navigation bar with user avatar and branding.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  /* Extract initials from email or display name */
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2.5 group"
        >
          {/* Logo */}
          <img
            src="/beyond_grades_logo.png"
            alt="Beyond Grades"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="text-base font-semibold text-brand-text group-hover:text-brand-primary transition-colors duration-200">
            Beyond Grades
          </span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="text-sm text-brand-muted hidden sm:block max-w-[200px] truncate">
              {user.email}
            </span>
          )}

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {getInitials()}
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
