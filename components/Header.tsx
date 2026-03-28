"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import UserMenu from "@/components/UserMenu";

interface HeaderProps {
  variant?: "student" | "employer" | "default";
  tone?: "light" | "dark";
}

export default function Header({ variant, tone = "light" }: HeaderProps) {
  const pathname = usePathname();

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
  const isDarkTone = tone === "dark";

  const logoTextClass = isDarkTone ? "text-slate-100" : "text-gray-900";
  const navTextClass = isDarkTone
    ? "text-slate-300 hover:text-slate-100"
    : "text-gray-600 hover:text-gray-900";
  const secondaryButtonClass = isDarkTone
    ? "text-sky-200 hover:text-slate-100"
    : colors.textButton;

  const getNavLinks = () => {
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

  const { user, isLoading } = useUser();

  const logoHref = user
    ? resolvedVariant === "employer"
      ? "/employer"
      : "/student"
    : "/";

  const returnTo =
    resolvedVariant === "student"
      ? "/student"
      : resolvedVariant === "employer"
        ? "/employer"
        : "/";

  return (
    <header className="px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={logoHref} className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 ${colors.logo} rounded-lg flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">IN</span>
          </div>
          <span className={`text-2xl font-bold ${logoTextClass}`}>
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
            <UserMenu
              profileImage={user.picture}
              name={(user.name ?? user.email ?? "") as string}
            />
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
