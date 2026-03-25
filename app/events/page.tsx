import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import Link from "next/link";
import { getLiveEvents } from "@/app/student/events/events";
import { auth0 } from "@/lib/auth0";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await auth0.getSession();
  const isAuthenticated = Boolean(session);
  const events = await getLiveEvents();

  return (
    <AnimatedBackground subtle>
      <Header variant="default" tone="dark" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Events
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Grow Your Circle: local networking events to meet peers, mentors, and employers.
            </p>
          </div>
          {!isAuthenticated && (
            <section className="mb-6 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-200">
              Sign in to post events.{" "}
              <Link href="/login" className="font-semibold underline">
                Go to login
              </Link>
              .
            </section>
          )}

          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">
                No events listed yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="relative border border-gray-100 dark:border-gray-700 rounded-lg p-6"
                >
                  <Link
                    href={`/events/${event.id}`}
                    className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    aria-label={`View details for ${event.title}`}
                  >
                    <span className="sr-only">View details</span>
                  </Link>
                  <div className="relative z-20 pointer-events-none md:flex md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        {event.description}
                      </p>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        {event.location}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.date}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.time}
                      </p>
                      <span className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <section className="mt-10 rounded-lg border border-blue-100 bg-blue-50/60 p-5 text-sm text-blue-900 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-200">
            If users want to post events to InternsNow, they can by{" "}
            <Link href="/events/manage" className="font-semibold underline">
              clicking here
            </Link>
            .
          </section>
        </div>
      </main>

      <Footer variant="default" tone="dark" />
    </AnimatedBackground>
  );
}
