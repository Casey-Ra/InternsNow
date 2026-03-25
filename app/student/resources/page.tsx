import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function ResourcesPage() {
  return (
    <AnimatedBackground subtle>
      <Header variant="student" tone="dark" />

      <main className="flex-grow px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Student Resources
          </h1>
          
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Career Resources Coming Soon!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're finding the best career resources, interview tips, and professional 
              development guides for students like you.
            </p>
            <div className="text-6xl mb-4">📚</div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Stay tuned!
            </p>
          </div>
        </div>
      </main>

      <Footer variant="student" tone="dark" />
    </AnimatedBackground>
  );
}