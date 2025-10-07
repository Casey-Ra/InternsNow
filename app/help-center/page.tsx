import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Help Center
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We're building a comprehensive help center to support you.
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our help center is currently under development. We're creating detailed guides, tutorials, and support resources to help you make the most of InternsNow.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Soon you'll find step-by-step guides, video tutorials, and answers to common questions right here.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer variant="default" />
    </div>
  );
}