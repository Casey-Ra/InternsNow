import React from "react";

export default function NotEduPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Access restricted</h1>
        <p className="mb-4">
          This site is only available to users with a .edu email address.
        </p>
        <p className="mb-4">
          If you believe you should have access, please sign in with your school
          email or contact support.
        </p>
        <a
          href="/student/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with .edu email
        </a>
      </div>
    </main>
  );
}
