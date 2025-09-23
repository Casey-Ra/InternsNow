import Link from "next/link";

export default function EmployerLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IN</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">InternsNow</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Pricing</a>
            <a href="#solutions" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Solutions</a>
            <a href="#resources" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Resources</a>
          </nav>
          <div className="flex space-x-4">
            <button className="px-4 py-2 text-green-600 hover:text-green-700 font-medium">Sign In</button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Post a Job</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Find Exceptional Talent
              <span className="text-green-600 block">Start Here</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with motivated students and recent graduates who are eager to contribute, 
              learn, and grow with your organization.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg">
                Post Your First Job Free
              </button>
              <button className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 font-semibold text-lg">
                Schedule a Demo
              </button>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Quality Candidates</h3>
              <p className="text-gray-600 dark:text-gray-300">Access pre-screened students from top universities with verified academic credentials and portfolios.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fast Hiring</h3>
              <p className="text-gray-600 dark:text-gray-300">Streamlined application process with smart matching reduces time-to-hire by 60%.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Cost Effective</h3>
              <p className="text-gray-600 dark:text-gray-300">Competitive pricing with transparent costs. No hidden fees or long-term contracts required.</p>
            </div>
          </div>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  title: "Post Your Job",
                  description: "Create a detailed job posting with requirements, responsibilities, and company culture.",
                  icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                },
                {
                  step: "2",
                  title: "Get Matched",
                  description: "Our AI matches your job with qualified candidates based on skills and preferences.",
                  icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                },
                {
                  step: "3",
                  title: "Review Applications",
                  description: "Browse candidate profiles, portfolios, and application materials in one place.",
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                },
                {
                  step: "4",
                  title: "Hire & Onboard",
                  description: "Connect with your chosen candidates and begin their journey with your company.",
                  icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                  </div>
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Preview */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Free</div>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>1 job posting</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Basic candidate search</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Email support</li>
                </ul>
                <button className="w-full py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-semibold">
                  Get Started
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-green-600 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Professional</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">$199<span className="text-lg text-gray-500">/month</span></div>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>10 job postings</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Advanced matching</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Priority support</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Analytics dashboard</li>
                </ul>
                <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                  Start Free Trial
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Custom</div>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Unlimited postings</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Dedicated support</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Custom integrations</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>White-label options</li>
                </ul>
                <button className="w-full py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-semibold">
                  Contact Sales
                </button>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-green-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Hire?</h2>
            <p className="text-xl mb-8 opacity-90">Join hundreds of companies finding exceptional talent through InternsNow</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-semibold text-lg">
                Post Your First Job
              </button>
              <button className="px-8 py-4 bg-green-700 text-white rounded-lg hover:bg-green-800 font-semibold text-lg border-2 border-green-500">
                Schedule a Demo
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IN</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">InternsNow</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">The premier platform for connecting employers with exceptional student talent.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">For Employers</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-green-600">Post Jobs</a></li>
                <li><a href="#" className="hover:text-green-600">Search Candidates</a></li>
                <li><a href="#" className="hover:text-green-600">Pricing</a></li>
                <li><a href="#" className="hover:text-green-600">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Solutions</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-green-600">Internship Programs</a></li>
                <li><a href="#" className="hover:text-green-600">Entry-Level Hiring</a></li>
                <li><a href="#" className="hover:text-green-600">Campus Recruiting</a></li>
                <li><a href="#" className="hover:text-green-600">API Integration</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-green-600">Help Center</a></li>
                <li><a href="#" className="hover:text-green-600">Contact Sales</a></li>
                <li><a href="#" className="hover:text-green-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-green-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 InternsNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
