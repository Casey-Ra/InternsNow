"use client";

import { useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Login successful!");
        // TODO: save token in localStorage or cookies
      } else {
        setMessage("❌ " + (data.error || "Invalid credentials"));
      }
    } catch (err) {
      setMessage("❌ Network error, is the backend running?");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header variant="student" />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Student Login
          </h1>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:bg-gray-700 dark:text-white"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:bg-gray-700 dark:text-white"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold
                         py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <a
              href="/student/register"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign Up
            </a>
          </p>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
