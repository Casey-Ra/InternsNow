import type { Metadata } from "next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Student Portal - Find Your Dream Internship | InternsNow",
  description:
    "Discover internships and entry-level positions at top companies. Build your experience, network with professionals, and kickstart your dream career.",
  keywords: [
    "student jobs",
    "internships",
    "entry level",
    "career opportunities",
    "college students",
  ],
  openGraph: {
    title: "Student Portal - Find Your Dream Internship | InternsNow",
    description:
      "Discover internships and entry-level positions at top companies.",
    url: "https://internsnow.vercel.app/student",
  },
};

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      {/* Hero Section */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Launch Your Career with
              <span className="text-blue-600 block">Perfect Internships</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover internships and entry-level positions at top companies.
              Build your experience, network with professionals, and kickstart
              your dream career.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <input
                  type="text"
                  placeholder="Job title, company, or keywords"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="md:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  Search Jobs
                </button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Smart Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI matches you with opportunities based on your skills,
                interests, and career goals.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Verified Companies
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All employers are verified and committed to providing meaningful
                learning experiences.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Fast Applications
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Apply to multiple positions with one click using your optimized
                profile.
              </p>
            </div>
          </div>

          {/* Popular Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Popular Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  name: "Software Engineering",
                  count: "1,234 jobs",
                  color: "bg-blue-500",
                },
                { name: "Marketing", count: "567 jobs", color: "bg-green-500" },
                { name: "Design", count: "432 jobs", color: "bg-purple-500" },
                {
                  name: "Data Science",
                  count: "789 jobs",
                  color: "bg-orange-500",
                },
                { name: "Business", count: "654 jobs", color: "bg-red-500" },
                { name: "Finance", count: "321 jobs", color: "bg-yellow-500" },
                { name: "Healthcare", count: "456 jobs", color: "bg-pink-500" },
                {
                  name: "Engineering",
                  count: "543 jobs",
                  color: "bg-indigo-500",
                },
              ].map((category, index) => (
                <button
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all text-left group"
                >
                  <div
                    className={`w-8 h-8 ${category.color} rounded-lg mb-3 group-hover:scale-110 transition-transform`}
                  ></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {category.count}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who have found their perfect
              internships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-lg">
                Create Your Profile
              </button>
              <button className="px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold text-lg border-2 border-blue-500">
                Browse Opportunities
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
