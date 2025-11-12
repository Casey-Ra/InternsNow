import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findInternshipById } from "@/app/lib/models/Internship";

type PageProps = {
  params: {
    id: string;
  };
};

function formatDate(iso?: string | Date) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch (e) {
    return "";
  }
}

export async function generateMetadata({ params }: PageProps) {
  const internship = await findInternshipById(params.id);
  if (!internship) {
    return { title: "Opportunity not found • InternsNow" };
  }
  return { title: `${internship.company_name} opportunity • InternsNow` };
}

export default async function InternshipDetailsPage({ params }: PageProps) {
  const internship = await findInternshipById(params.id);

  if (!internship) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <Link
            href="/student/find-opportunities"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to listings
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{internship.company_name}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Posted on {formatDate(internship.created_at)}</p>
          </div>

          <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
            {internship.job_description}
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <a
              href={internship.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Apply Now
            </a>
            <Link
              href="/student/find-opportunities"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Back to Listings
            </Link>
          </div>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
