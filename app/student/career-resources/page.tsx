import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CareerResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Career Resources
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We're curating the best career development resources for students.
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our career resources section is currently being developed. We're compiling guides, articles, tutorials, and tools to help you build a successful career.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Soon you'll find resume templates, interview tips, industry insights, salary guides, and career planning tools all in one place.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer variant="student" />
    </div>
  );
}