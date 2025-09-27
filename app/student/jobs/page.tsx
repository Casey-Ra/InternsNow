import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header variant="student" />

      <main className="flex-grow px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Browse Internships
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Coming Soon!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature will be available soon.
            </p>
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              In the meantime, make sure your profile is complete and ready to go!
            </p>
          </div>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}