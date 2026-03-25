import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import QuickMatchQuiz from "@/components/QuickMatchQuiz";
import { parseIntakeParams, type IntakeSearchParams } from "./intakeParams";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<IntakeSearchParams>;
};

export default async function IntakePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { location, major, effectiveInterests } = parseIntakeParams(params);

  return (
    <AnimatedBackground subtle>
      <Header variant="default" tone="dark" />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        <section className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quick Match
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Take a short three-question quiz and see limited internships,
              entry-level jobs, and networking events right away. No account
              required.
            </p>
          </div>

          <QuickMatchQuiz
            initialLocation={location}
            initialMajor={major}
            initialInterests={effectiveInterests}
          />
        </section>
      </main>

      <Footer variant="default" tone="dark" />
    </AnimatedBackground>
  );
}
