"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import UserMenu from "@/components/UserMenu";
import { useSyncExternalStore } from "react";

type SeekingValue = "job" | "internship" | "both" | null;

const SEEKING_CACHE_KEY = "internsnow_seeking";

function getSeekingSnapshot(): SeekingValue {
  try {
    const v = localStorage.getItem(SEEKING_CACHE_KEY);
    return v === "job" || v === "internship" || v === "both" ? v : null;
  } catch {
    return null;
  }
}

function useSeekingLabel(): string {
  const seeking = useSyncExternalStore(
    () => () => {},
    getSeekingSnapshot,
    () => null,
  );

  if (seeking === "job") return "Jobs";
  if (seeking === "internship") return "Internships";
  return "Jobs & Internships";
}

interface HeaderProps {
  variant?: "student" | "employer" | "default";
  tone?: "light" | "dark";
}

export default function Header({ variant, tone = "light" }: HeaderProps) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const opportunitiesLabel = useSeekingLabel();

  const pathVariant = pathname?.startsWith("/student")
    ? "student"
    : pathname?.startsWith("/employer")
      ? "employer"
      : "default";

  const resolvedVariant =
    pathVariant === "default" ? "default" : (variant ?? pathVariant);

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
  const logoTextClass = "text-gray-900 dark:text-white";
  const navTextClass = "text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white";
  const secondaryButtonClass = `${colors.textButton} dark:text-sky-300 dark:hover:text-white`;

  const homeHref = user
    ? resolvedVariant === "employer"
      ? "/employer"
      : "/student"
    : "/";

  const getNavLinks = () => {
    if (user) {
      switch (resolvedVariant) {
        case "employer":
          return [{ href: homeHref, label: "Home" }];
        default:
          return [
            { href: homeHref, label: "Home" },
            { href: "/opportunities", label: opportunitiesLabel },
            { href: "/events", label: "Events" },
            { href: "/student/resources", label: "Resources" },
          ];
      }
    }

    switch (resolvedVariant) {
      case "student":
        return [
          { href: "/student", label: "Home" },
          { href: "/opportunities", label: "Jobs & Internships" },
          { href: "/events", label: "Events" },
          { href: "/student/resources", label: "Resources" },
        ];
      default:
        return [
          { href: "/intake", label: "Quick Match" },
          { href: "/opportunities", label: "Jobs & Internships" },
          { href: "/events", label: "Events" },
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

  const returnTo =
    resolvedVariant === "student"
      ? "/student"
      : resolvedVariant === "employer"
        ? "/employer"
        : "/";

  return (
    <header className="px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href={homeHref}
          aria-label={user ? "Go to your home screen" : "Go to InternsNow home"}
          className="flex items-center space-x-2"
        >
          <div
            className={`w-10 h-10 ${colors.logo} rounded-lg flex items-center justify-center`}
          >
            <span className="text-white font-bold text-base">IN</span>
          </div>
          <span className={`text-3xl font-bold ${logoTextClass}`}>
            InternsNow
          </span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg ${navTextClass}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex space-x-4">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">...</div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={homeHref}
                className="md:hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Home
              </Link>
              <UserMenu
                profileImage={user.picture}
                name={(user.name ?? user.email ?? "") as string}
              />
            </div>
          ) : (
            <>
              <a
                href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
                className={`px-4 py-2 font-medium ${secondaryButtonClass}`}
              >
                {buttonText.secondary}
              </a>

              <a
                href={`/auth/login?screen_hint=signup&returnTo=${encodeURIComponent(
                  returnTo,
                )}`}
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
