import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We're working on this page! Check back soon.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our features page is under development. Soon you'll find detailed information about all the powerful 
              tools and functionality that make InternsNow the best platform for connecting students with internship opportunities.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                What to Expect:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
                <li>• Smart matching algorithm</li>
                <li>• AI-powered resume builder</li>
                <li>• Interactive interview practice</li>
                <li>• Career resource library</li>
                <li>• Real-time application tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer variant="default" />
    </div>
  );
}