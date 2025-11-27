import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllInternships } from "@/app/lib/models/Internship";
import ManageInternshipsClient from "@/app/manage-internships/ManageInternshipsClient";

// Prevent static generation - this page needs database access at runtime
export const dynamic = 'force-dynamic';

export default async function ManageInternshipsPage() {
  const internships = await getAllInternships();
  // Next.js serializes props to the client; ensure dates are strings
  const initialData = internships.map((it) => ({ ...it, created_at: it.created_at?.toISOString?.() ?? String(it.created_at) }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
          <h1 className="text-2xl font-semibold mb-4">Manage Internships</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Edit or remove internships you've posted.</p>

          {/* Client-side component handles editing/deleting */}
          <ManageInternshipsClient initialData={initialData} />
        </div>
      </main>

      <Footer variant="default" />
    </div>
  );
}
