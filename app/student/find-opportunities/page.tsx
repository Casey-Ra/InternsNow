import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FindOpportunitiesPage() {
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
              We're building an amazing opportunity discovery platform.
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our opportunity finder is currently under development. We're creating a powerful search and discovery tool to help you find the perfect internships and entry-level positions.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Soon you'll be able to search by location, industry, company size, and more to discover opportunities that match your interests and career goals.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer variant="student" />
    </div>
  );
}