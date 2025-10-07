import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="student" />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Builder
          </h1>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 inline-block">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">�</span>
            </div>
            <h2 className="text-2xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Work in Progress
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 max-w-md">
              We're building an amazing resume builder for you. Check back soon for AI-powered resume creation tools!
            </p>
          </div>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}