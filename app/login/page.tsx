"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const handleAuth0Login = async () => {
    window.location.href = "/api/auth/login-auth0";
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
            Don’t have an account?{" "}
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
