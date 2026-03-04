"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

type NodePoint = {
  id: string;
  x: number;
  y: number;
  icon: "briefcase" | "person";
};

const nodes: NodePoint[] = [
  { id: "n1", x: 120, y: 160, icon: "briefcase" },
  { id: "n2", x: 330, y: 250, icon: "person" },
  { id: "n3", x: 560, y: 170, icon: "briefcase" },
  { id: "n4", x: 760, y: 290, icon: "person" },
  { id: "n5", x: 1010, y: 190, icon: "briefcase" },
  { id: "n6", x: 180, y: 470, icon: "person" },
  { id: "n7", x: 360, y: 350, icon: "briefcase" },
  { id: "n8", x: 580, y: 460, icon: "person" },
  { id: "n9", x: 780, y: 390, icon: "briefcase" },
  { id: "n10", x: 1030, y: 520, icon: "person" },
  { id: "n11", x: 270, y: 620, icon: "briefcase" },
  { id: "n12", x: 420, y: 520, icon: "person" },
  { id: "n13", x: 640, y: 610, icon: "briefcase" },
  { id: "n14", x: 870, y: 540, icon: "person" },
];

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-100" fill="none">
      <path
        d="M8 7V5.5C8 4.67 8.67 4 9.5 4h5c.83 0 1.5.67 1.5 1.5V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 12h16M10 12v2h4v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonTieIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-100" fill="none">
      <circle cx="12" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.5 20v-2.2c0-2.7 2.8-4.8 5.5-4.8s5.5 2.1 5.5 4.8V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11 13.2l1 1.4 1-1.4-.7 3.2.7 2.6h-2l.7-2.6-.7-3.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomeLandingPage() {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const hoveredNodeId = useMemo(() => {
    if (!pointer) return null;
    let winner: { id: string; dist: number } | null = null;
    for (const node of nodes) {
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 40 && (!winner || dist < winner.dist)) {
        winner = { id: node.id, dist };
      }
    }
    return winner?.id ?? null;
  }, [pointer]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.14),transparent_40%),radial-gradient(circle_at_50%_70%,rgba(16,185,129,0.12),transparent_45%)]" />

      <div
        className="pointer-events-auto absolute inset-0 opacity-40"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 1200;
          const y = ((e.clientY - rect.top) / rect.height) * 800;
          setPointer({ x, y });
        }}
        onMouseLeave={() => setPointer(null)}
      >
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
          {nodes.map((node) => {
            const active = node.id === hoveredNodeId;
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={active ? 22 : 6}
                  fill={active ? "rgba(14,165,233,0.35)" : "rgba(56,189,248,0.9)"}
                  stroke={active ? "rgba(186,230,253,0.9)" : "transparent"}
                  strokeWidth={active ? 1.5 : 0}
                  style={{ transition: "all 160ms ease" }}
                />
                {active && (
                  <foreignObject x={node.x - 16} y={node.y - 16} width="32" height="32">
                    <div className="h-8 w-8 flex items-center justify-center">
                      {node.icon === "briefcase" ? <BriefcaseIcon /> : <PersonTieIcon />}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="relative z-10">
        <Header variant="default" />

        <main className="px-6 pb-16 pt-10">
          <div className="max-w-6xl mx-auto">
            <section className="rounded-3xl border border-sky-400/25 bg-slate-900/35 backdrop-blur-sm p-8 md:p-12 shadow-[0_0_60px_rgba(14,165,233,0.2)]">
              <div className="max-w-4xl mx-auto text-center">
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
                    href="/intake"
                    className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
                  >
                    Find Your Career Now.
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

        <footer className="relative z-10 px-6 py-8 mt-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto text-center text-slate-400">
            <p>&copy; 2025 InternsNow. Built for connecting talent with opportunity.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
