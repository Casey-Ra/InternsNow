"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AUTH0_SIGNUP_URL } from "@/lib/authUrls";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header variant="student" />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Student Sign Up
          </h1>

          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Create your account securely with Auth0
          </p>

          <a
            href={AUTH0_SIGNUP_URL}
            className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Sign Up with Auth0
          </a>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Not ready to sign up?{" "}
            <a href="/intake" className="text-blue-600 hover:underline dark:text-blue-400">
              Try the quick intake survey
            </a>
          </p>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Login
            </a>
          </p>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
