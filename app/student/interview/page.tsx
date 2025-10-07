import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AIInterviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header variant="student" />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Interview Practice
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Practice interviews with our AI-powered system and get real-time feedback to improve your performance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* AI Interview Features */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Master Your Interview Skills
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      AI-Powered Questions
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Practice with realistic questions tailored to your field and experience level.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Real-time Feedback
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get instant analysis of your responses, tone, and body language.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Personalized Practice
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get customized interview questions based on your profile and goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">📈</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Performance Tracking
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monitor your progress and see improvement over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg">
                Start Mock Interview
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Complete interview simulation • Get detailed report
              </p>
            </div>
          </div>

          {/* Interview Simulator Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AI Interview Simulator
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🎤</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  AI Interviewer Ready
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-xs mx-auto">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    "Tell me about yourself and why you're interested in this role."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}