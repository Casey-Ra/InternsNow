import Link from "next/link";
import Header from "../components/Header";

export default function HomeLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.14),transparent_40%),radial-gradient(circle_at_50%_70%,rgba(16,185,129,0.12),transparent_45%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-35">
        <svg
          className="h-full w-full"
          viewBox="0 0 1200 800"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="rgba(125,211,252,0.35)" strokeWidth="1.2" fill="none">
            <path d="M120 160 L330 250 L560 170 L760 290 L1010 190" />
            <path d="M180 470 L360 350 L580 460 L780 390 L1030 520" />
            <path d="M270 620 L420 520 L640 610 L870 540" />
            <path d="M330 250 L360 350" />
            <path d="M560 170 L580 460" />
            <path d="M760 290 L780 390" />
          </g>
          <g fill="rgba(56,189,248,0.9)">
            <circle cx="120" cy="160" r="6" />
            <circle cx="330" cy="250" r="7" />
            <circle cx="560" cy="170" r="7" />
            <circle cx="760" cy="290" r="7" />
            <circle cx="1010" cy="190" r="6" />
            <circle cx="180" cy="470" r="6" />
            <circle cx="360" cy="350" r="7" />
            <circle cx="580" cy="460" r="7" />
            <circle cx="780" cy="390" r="7" />
            <circle cx="1030" cy="520" r="6" />
            <circle cx="270" cy="620" r="6" />
            <circle cx="420" cy="520" r="7" />
            <circle cx="640" cy="610" r="7" />
            <circle cx="870" cy="540" r="6" />
          </g>
        </svg>
      </div>

      <div className="relative z-10">
        <Header variant="default" />

        <main className="px-6 pb-16 pt-10">
          <div className="max-w-6xl mx-auto">
            <section className="rounded-3xl border border-sky-400/30 bg-slate-900/70 backdrop-blur-md p-8 md:p-12 shadow-[0_0_60px_rgba(14,165,233,0.2)]">
              <div className="max-w-4xl mx-auto text-center">
                <p className="inline-flex items-center rounded-full border border-sky-300/40 bg-sky-950/70 px-4 py-1 text-sm text-sky-200">
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
                    href="/intake"
                    className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
                  >
                    Find Your Career Now.
                  </Link>
                </div>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3 text-left">
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                  <p className="text-sm text-sky-200">Career Discovery</p>
                  <p className="mt-2 text-slate-300">
                    Quick signal capture to surface relevant opportunities.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                  <p className="text-sm text-sky-200">Event Networking</p>
                  <p className="mt-2 text-slate-300">
                    Explore local events to meet mentors and recruiters.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                  <p className="text-sm text-sky-200">Actionable Path</p>
                  <p className="mt-2 text-slate-300">
                    Move from discovery to application with less friction.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="relative z-10 px-6 py-8 mt-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto text-center text-slate-400">
            <p>&copy; 2025 InternsNow. Built for connecting talent with opportunity.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
