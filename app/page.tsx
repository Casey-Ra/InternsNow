"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";

export default function HomeLandingPage() {
  const { user, isLoading } = useUser();
  const studentCtaHref = !isLoading && user ? "/student" : "/intake";

  return (
    <AnimatedBackground>
      <Header variant="default" tone="dark" />

      <main className="px-6 pb-16 pt-10">
        <div className="max-w-6xl mx-auto">
          <section className="rounded-3xl border border-sky-400/25 bg-slate-900/18 p-8 md:p-12 shadow-[0_0_60px_rgba(14,165,233,0.2)]">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-[1px] leading-[1px] text-slate-500">
                Connect Students with Dream Opportunities
              </p>
              <p className="inline-flex items-center rounded-full border border-sky-300/40 bg-sky-950/60 px-4 py-1 text-sm text-sky-200">
                Tech Careers Start with Better Signals
              </p>
              <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight">
                Network Into Your Next Career Move
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
                InternsNow connects students to internships, entry-level
                roles, and high-value networking events in one focused path.
              </p>

              <div className="mt-10 flex justify-center">
                <Link
                  href={studentCtaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
                >
                  Find Your Career Now.
                </Link>
              </div>
              <div className="mt-4 flex justify-center">
                <Link
                  href={studentCtaHref}
                  className="text-sm text-slate-300 hover:text-slate-100 underline"
                >
                  I&apos;m a Student
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3 text-left">
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="text-sm text-sky-200">Career Discovery</p>
                <p className="mt-2 text-slate-300">
                  Quick signal capture to surface relevant opportunities.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="text-sm text-sky-200">Event Networking</p>
                <p className="mt-2 text-slate-300">
                  Explore local events to meet mentors and recruiters.
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="text-sm text-sky-200">Actionable Path</p>
                <p className="mt-2 text-slate-300">
                  Move from discovery to application with less friction.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer variant="default" tone="dark" />
    </AnimatedBackground>
  );
}
