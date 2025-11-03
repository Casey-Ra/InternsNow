"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AddInternshipPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateUrl = (v: string) => {
    try {
      // basic check
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!companyName.trim() || !jobDescription.trim() || !url.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    if (companyName.length > 255) {
      setError("Company name must be 255 characters or less.");
      return;
    }

    if (jobDescription.length > 5000) {
      setError("Job description is too long.");
      return;
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL (include http:// or https://)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/internships/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          job_description: jobDescription.trim(),
          url: url.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create internship");
        setLoading(false);
        return;
      }

      setSuccess("Internship created successfully — redirecting...");
      setCompanyName("");
      setJobDescription("");
      setUrl("");

      // short delay then navigate to manage internships
      setTimeout(() => {
        router.push("/manage-internships");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />

      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
          <h1 className="text-2xl font-semibold mb-4">Add Internship</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Share an internship opportunity with students. We'll display it on the student opportunities page.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Acme Corp"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={8}
                placeholder="Describe the internship role, responsibilities, and qualifications"
                maxLength={5000}
              />
              <p className="text-xs text-gray-500 mt-1">You can include qualifications, duration, location, and application details.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL (application link)</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="https://example.com/apply"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                disabled={loading}
              >
                {loading ? "Saving..." : "Create Internship"}
              </button>

              {success && <p className="text-sm text-green-600">{success}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </div>
      </main>

      <Footer variant="default" />
    </div>
  );
}
