"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const auth0Unavailable = searchParams.get("auth0") === "unavailable";

  const handleAuth0Login = async () => {
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header variant="student" />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Student Login
          </h1>

          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Sign in securely using Auth0
          </p>

          {auth0Unavailable && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              Auth0 is unavailable for this deployment. On Vercel previews, this
              usually means the Preview environment variables or Auth0 callback/logout
              URLs are not configured for the preview URL yet.
            </div>
          )}

          <button
            onClick={handleAuth0Login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Continue with Auth0
          </button>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Just browsing?{" "}
            <a href="/intake" className="text-blue-600 hover:underline dark:text-blue-400">
              Start with the quick intake survey
            </a>
          </p>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign Up
            </a>
          </p>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
