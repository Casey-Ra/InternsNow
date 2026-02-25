import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageEventsClient, {
  type ManagedEventItem,
} from "@/app/events/ManageEventsClient";
import { canManageEvent, getEventActor } from "@/app/lib/auth/eventAccess";
import { getEvents, toEventView } from "@/app/lib/models/Event";

export const dynamic = "force-dynamic";

export default async function EventsManagementPage() {
  const actor = await getEventActor();

  if (!actor) {
    redirect("/auth/login?returnTo=%2Fevents");
  }

  const eventRows = await getEvents({ includeDeleted: actor.isAdmin });
  const eventViews = eventRows.map(toEventView);

  const activeEvents: ManagedEventItem[] = eventViews
    .filter((event) => event.deletedAt === null)
    .map((event) => ({
      ...event,
      canManage: canManageEvent(event.createdBy, actor),
    }));

  const archivedEvents: ManagedEventItem[] = actor.isAdmin
    ? eventViews
        .filter((event) => event.deletedAt !== null)
        .map((event) => ({
          ...event,
          canManage: true,
        }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Events
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Post, edit, and archive networking events. Owners can manage their
            own events, and admins can manage all events.
          </p>

          <div className="mt-8">
            <ManageEventsClient
              initialActiveEvents={activeEvents}
              initialArchivedEvents={archivedEvents}
              currentUserSub={actor.sub}
              isAdmin={actor.isAdmin}
            />
          </div>
        </section>
      </main>

      <Footer variant="default" />
    </div>
  );
}
