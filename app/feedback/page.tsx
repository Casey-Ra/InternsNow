import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Feedback
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We're working on creating the best feedback system for you.
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our feedback system is currently under development. We're building a comprehensive platform where you can share your thoughts, suggestions, and experiences to help us improve InternsNow.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your input is valuable to us. Soon you'll be able to submit feedback, report issues, and suggest new features directly through this page.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer variant="default" />
    </div>
  );
}