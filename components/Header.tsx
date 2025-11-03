"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HeaderProps {
  variant?: "student" | "employer" | "default";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const getThemeColors = () => {
    switch (variant) {
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
    switch (variant) {
      case "student":
        return [
          { href: "/student", label: "Home" },
          { href: "/student/find-opportunities", label: "Find Opportunities" },
          { href: "/student/resources", label: "Resources" },
          { href: "/student/fluency-test", label: "AI Fluency Test" },
          { href: "/student/profile", label: "My Profile" },
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
    switch (variant) {
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

  const [auth, setAuth] = useState<{ loggedIn: boolean; isEdu: boolean } | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setAuth(data);
      })
      .catch(() => {
        if (mounted) setAuth({ loggedIn: false, isEdu: false });
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
          {auth === null ? (
            // loading placeholder
            <div className="px-4 py-2 text-gray-500">...</div>
          ) : auth.loggedIn ? (
            <>
              <Link
                href="/student/profile"
                className={`px-4 py-2 ${colors.textButton} font-medium`}
              >
                My Profile
              </Link>
              <Link
                href="/api/auth/logout"
                className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/student/login"
                className={`px-4 py-2 ${colors.textButton} font-medium`}
              >
                {buttonText.secondary}
              </Link>
              <Link
                href={variant === "student" ? "/student/register" : "/register"}
                className={`px-6 py-2 ${colors.button} text-white rounded-lg font-medium`}
              >
                {buttonText.primary}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
