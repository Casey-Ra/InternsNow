import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-gray-800 dark:text-gray-100">
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl font-bold mb-4">About InternsNow</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              InternsNow connects students with internship opportunities by simplifying 
              profile creation, skill discovery, and employer matching — all in one place.
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We believe internships should be accessible, transparent, and rewarding. 
              InternsNow helps students showcase their skills through clear profiles, 
              verified credentials, and personalized discovery — while enabling employers 
              to identify talent faster and more fairly.
            </p>
          </section>

          {/* How It Works */}
          <section className="mb-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">1. Create Your Profile</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Students can build rich profiles, add skills and interests, and upload 
                  resumes to showcase what makes them unique.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">2. Match With Opportunities</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our matching algorithm highlights internships aligned with students’ 
                  goals, experience, and availability — so everyone spends less time searching 
                  and more time learning.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">3. Connect and Grow</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Employers can reach out directly, track applicants, and build relationships 
                  with rising talent. Students can update profiles, gain feedback, and 
                  continuously improve.
                </p>
              </div>
            </div>
          </section>


        </div>
      </main>

      <Footer />
    </div>
  );
}
