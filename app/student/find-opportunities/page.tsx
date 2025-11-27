import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getAllInternships } from "@/app/lib/models/Internship";

// Prevent static generation - this page needs database access at runtime
export const dynamic = 'force-dynamic';

function formatDate(iso?: string | Date) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch (e) {
    return "";
  }
}

export default async function FindOpportunitiesPage() {
  const internships = await getAllInternships();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Find Opportunities
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Browse the latest internships submitted by employers.
            </p>
          </div>

          {internships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">No internships available yet. Check back later or ask employers to add opportunities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {internships.map((i) => (
                <div key={i.id} className="relative border border-gray-100 dark:border-gray-700 rounded-lg p-6">
                  <Link
                    href={`/student/find-opportunities/${i.id}`}
                    className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    aria-label={`View details for ${i.company_name}`}
                  >
                    <span className="sr-only">View details</span>
                  </Link>
                  <div className="relative z-20 pointer-events-none flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{i.company_name}</h3>
                      <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">{i.job_description.length > 800 ? `${i.job_description.slice(0, 800)}...` : i.job_description}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(i.created_at)}</p>
                      <a href={i.url} target="_blank" rel="noreferrer" className="pointer-events-auto mt-3 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">Apply</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
