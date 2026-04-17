import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findInternshipById } from "@/app/lib/models/Internship";
import { auth0 } from "@/lib/auth0";
import OpportunityPageCTA from "@/components/hustle/OpportunityPageCTA";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(iso?: string | Date) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const internship = await findInternshipById(id);
  if (!internship) {
    return { title: "Opportunity not found • InternsNow" };
  }
  return { title: `${internship.company_name} opportunity • InternsNow` };
}

export default async function OpportunityDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth0.getSession();
  const internship = await findInternshipById(id);

  if (!internship) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <Link
            href="/opportunities"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to listings
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {internship.company_name}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Posted on {formatDate(internship.created_at)}
            </p>
          </div>

          <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
            {internship.job_description}
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <OpportunityPageCTA
              applyUrl={internship.url}
              referenceId={internship.id}
              sourceLabel={internship.company_name}
              isLoggedIn={!!session}
            />
            <Link
              href="/opportunities"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Back to Listings
            </Link>
          </div>
        </div>
      </main>

      <Footer variant="default" />
    </div>
  );
}
