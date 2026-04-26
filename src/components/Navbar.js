"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Glassmorphism navigation bar with user avatar and branding.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  const navLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Feedback",
      href: "/feedback",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand + Nav Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2.5 group shrink-0"
          >
            {/* Logo */}
            <img
              src="/beyond_grades_logo.png"
              alt="Beyond Grades"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="text-base font-semibold text-brand-text group-hover:text-brand-primary transition-colors duration-200 hidden sm:block">
              Beyond Grades
            </span>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-brand-muted hover:text-brand-text hover:bg-brand-primary/5"
                    }
                  `}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="text-sm text-brand-muted hidden md:block max-w-[200px] truncate">
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
