import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findEventById } from "../events";
import { auth0 } from "@/lib/auth0";
import EventPageCTA from "@/components/hustle/EventPageCTA";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const event = await findEventById(id);
  if (!event) {
    return { title: "Event not found • InternsNow" };
  }
  return { title: `${event.title} • InternsNow` };
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth0.getSession();
  const event = await findEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <Link
            href="/student/events"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to events
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {event.date} • {event.time}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {event.location}
            </p>
          </div>

          <div className="text-gray-700 dark:text-gray-200 leading-relaxed space-y-3">
            <p>{event.description}</p>
            {event.details && event.details.trim() !== event.description.trim() ? (
              <p>{event.details}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Hosted By
              </p>
              <p className="mt-2 text-sm text-gray-900 dark:text-white">
                {event.host}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Cost
              </p>
              <p className="mt-2 text-sm text-gray-900 dark:text-white">
                {event.price}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <EventPageCTA
              registrationLink={event.registrationLink}
              referenceId={event.id}
              sourceLabel={event.title}
              sourceDate={event.date}
              sourceTime={event.time}
              sourceLocation={event.location}
              isLoggedIn={!!session}
            />
            <Link
              href="/student/events"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
