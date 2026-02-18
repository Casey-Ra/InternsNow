import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getEvents } from "./events";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Grow Your Circle
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Local networking events to meet peers, mentors, and employers.
            </p>
          </div>

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
                    href={`/student/events/${event.id}`}
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
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
