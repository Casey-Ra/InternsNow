"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";

interface HeaderProps {
  variant?: "student" | "employer" | "default";
}

export default function Header({ variant }: HeaderProps) {
  const pathname = usePathname();

  const pathVariant = pathname?.startsWith("/student")
    ? "student"
    : pathname?.startsWith("/employer")
    ? "employer"
    : "default";

  const resolvedVariant = pathVariant === "default" ? "default" : variant ?? pathVariant;
  const getThemeColors = () => {
    switch (resolvedVariant) {
      case "student":
        return {
          logo: "bg-blue-600",
          button: "bg-blue-600 hover:bg-blue-700",
          textButton: "text-blue-600 hover:text-blue-700",
        };
      case "employer":
        return {
          logo: "bg-green-600",
          button: "bg-green-600 hover:bg-green-700",
          textButton: "text-green-600 hover:text-green-700",
        };
      default:
        return {
          logo: "bg-blue-600",
          button: "bg-blue-600 hover:bg-blue-700",
          textButton: "text-blue-600 hover:text-blue-700",
        };
    }
  };

  const colors = getThemeColors();

  const getNavLinks = () => {
    switch (resolvedVariant) {
      case "student":
        return [
          { href: "/student", label: "Home" },
          { href: "/student/find-opportunities", label: "Find Opportunities" },
          { href: "/student/resources", label: "Resources" },
          { href: "/student/fluency-test", label: "AI Fluency Test" },
        ];
      default:
        return [
          { href: "/about", label: "About" },
          { href: "/features", label: "Features" },
          { href: "/contact", label: "Contact" },
        ];
    }
  };

  const getButtonText = () => {
    switch (resolvedVariant) {
      case "student":
        return { primary: "Sign Up", secondary: "Login" };
      case "employer":
        return { primary: "Post a Job", secondary: "Sign In" };
      default:
        return { primary: "Get Started", secondary: "Sign In" };
    }
  };

  const navLinks = getNavLinks();
  const buttonText = getButtonText();

  // --- Auth0 state ---
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/auth/profile") // ✅ Auth0’s built-in route
      .then((res) => {
        if (!res.ok) throw new Error("No session");
        return res.json();
      })
      .then((data) => {
        if (mounted) setSession(data);
      })
      .catch(() => {
        if (mounted) setSession(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 ${colors.logo} rounded-lg flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">IN</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            InternsNow
          </span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex space-x-4">
          {loading ? (
            <div className="px-4 py-2 text-gray-500">...</div>
          ) : session ? (
            <UserMenu
              profileImage={session.user?.picture}
              name={session.user?.name}
            />
          ) : (
            <>
              <a
                href="/auth/login?returnTo=/student"
                className={`px-4 py-2 ${colors.textButton} font-medium`}
              >
                {buttonText.secondary}
              </a>
              <a
                href="/auth/login?screen_hint=signup&returnTo=/student"
                className={`px-6 py-2 ${colors.button} text-white rounded-lg font-medium`}
              >
                {buttonText.primary}
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
