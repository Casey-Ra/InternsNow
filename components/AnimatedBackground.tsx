"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type NodePoint = {
  id: string;
  x: number;
  y: number;
  icon: "briefcase" | "person" | "resume" | "pen" | "school";
};

type AnimatedNode = NodePoint & { tx: number; ty: number };
type Edge = { from: string; to: string };

// ── Full node set (landing page) ──────────────────────────────────────────────
const fullNodes: NodePoint[] = [
  { id: "n1",  x: 120,  y: 160, icon: "briefcase" },
  { id: "n2",  x: 330,  y: 250, icon: "person"    },
  { id: "n3",  x: 560,  y: 170, icon: "resume"    },
  { id: "n4",  x: 760,  y: 290, icon: "school"    },
  { id: "n5",  x: 1010, y: 190, icon: "pen"       },
  { id: "n6",  x: 180,  y: 470, icon: "person"    },
  { id: "n7",  x: 360,  y: 350, icon: "resume"    },
  { id: "n8",  x: 580,  y: 460, icon: "briefcase" },
  { id: "n9",  x: 780,  y: 390, icon: "school"    },
  { id: "n10", x: 1030, y: 520, icon: "pen"       },
  { id: "n11", x: 270,  y: 620, icon: "resume"    },
  { id: "n12", x: 420,  y: 520, icon: "person"    },
  { id: "n13", x: 640,  y: 610, icon: "briefcase" },
  { id: "n14", x: 870,  y: 540, icon: "school"    },
];

const fullEdges: Edge[] = [
  { from: "n1",  to: "n2"  },
  { from: "n2",  to: "n3"  },
  { from: "n3",  to: "n4"  },
  { from: "n4",  to: "n5"  },
  { from: "n6",  to: "n7"  },
  { from: "n7",  to: "n8"  },
  { from: "n8",  to: "n9"  },
  { from: "n9",  to: "n10" },
  { from: "n11", to: "n12" },
  { from: "n12", to: "n13" },
  { from: "n13", to: "n14" },
  { from: "n2",  to: "n7"  },
  { from: "n3",  to: "n8"  },
  { from: "n4",  to: "n9"  },
];

// ── Subtle node set (inner pages) — sparser, lower density ───────────────────
const subtleNodes: NodePoint[] = [
  { id: "n1",  x: 120,  y: 160, icon: "briefcase" },
  { id: "n3",  x: 560,  y: 170, icon: "resume"    },
  { id: "n5",  x: 1010, y: 190, icon: "pen"       },
  { id: "n6",  x: 180,  y: 470, icon: "person"    },
  { id: "n8",  x: 580,  y: 460, icon: "briefcase" },
  { id: "n10", x: 1030, y: 520, icon: "pen"       },
  { id: "n11", x: 270,  y: 620, icon: "resume"    },
  { id: "n14", x: 870,  y: 540, icon: "school"    },
];

const subtleEdges: Edge[] = [
  { from: "n1",  to: "n3"  },
  { from: "n3",  to: "n5"  },
  { from: "n6",  to: "n8"  },
  { from: "n8",  to: "n10" },
  { from: "n3",  to: "n8"  },
  { from: "n11", to: "n14" },
];

// ── Icon components ───────────────────────────────────────────────────────────
function BriefcaseIcon() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-4 -4.5V-5.4C-4 -6.2 -3.3 -6.9 -2.5 -6.9h5c0.8 0 1.5 0.7 1.5 1.5v0.9" strokeWidth="1.4" />
      <rect x="-8" y="-4.5" width="16" height="10.5" rx="2" strokeWidth="1.4" />
      <path d="M-8 0h16M-2 0.1v2h4v-2" strokeWidth="1.4" />
    </g>
  );
}

function PersonTieIcon() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="-4.5" r="3" strokeWidth="1.4" />
      <path d="M-5.5 6v-1.8c0-2.5 2.7-4.4 5.5-4.4s5.5 1.9 5.5 4.4V6" strokeWidth="1.4" />
      <path d="M-1 -0.2L0 1.4 1 -0.2 0.3 2.5 1 5.3H-1L-0.3 2.5-1 -0.2Z" strokeWidth="1.2" />
    </g>
  );
}

function ResumeIcon() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="-7" y="-7" width="14" height="14" rx="2" strokeWidth="1.4" />
      <path d="M-3.8 -3.6h7.6M-3.8 -0.8h7.6M-3.8 2h5.8" strokeWidth="1.4" />
    </g>
  );
}

function PenIcon() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-5.4 5.6l2.2-0.4 7.4-7.4-1.8-1.8-7.4 7.4-0.4 2.2Z" strokeWidth="1.4" />
      <path d="M1.6-4.6l1.8 1.8M-4.8 4.8l1.9-1.9" strokeWidth="1.4" />
    </g>
  );
}

function SchoolIcon() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-8 -1l8-4 8 4-8 4-8-4Z" strokeWidth="1.4" />
      <path d="M-4 1.4V4c0 1.8 2.2 3.1 4 3.1s4-1.3 4-3.1V1.4" strokeWidth="1.4" />
      <path d="M8-1v4.4" strokeWidth="1.4" />
    </g>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface AnimatedBackgroundProps {
  children: React.ReactNode;
  /** subtle=true uses fewer nodes, lower opacity, and reduced interaction */
  subtle?: boolean;
  className?: string;
}

export default function AnimatedBackground({
  children,
  subtle = false,
  className = "",
}: AnimatedBackgroundProps) {
  const nodes  = subtle ? subtleNodes  : fullNodes;
  const edges  = subtle ? subtleEdges  : fullEdges;

  // Tuning params differ between full and subtle modes
  const influenceRadius = subtle ? 170  : 210;
  const maxAttract      = subtle ? 0.6  : 0.9;
  const blowupRadius    = subtle ? 120  : 160;
  const svgOpacity      = subtle ? 0.45 : 1;
  const edgeBaseAlpha   = subtle ? 0.12 : 0.24;
  const edgeBoostAlpha  = subtle ? 0.28 : 0.42;
  const nodeBaseColor   = subtle
    ? "rgba(92,226,255,0.5)"
    : "rgba(92,226,255,0.96)";
  const nodeActiveColor = subtle
    ? "rgba(30,170,240,0.28)"
    : "rgba(30,170,240,0.48)";
  const maxRadius       = subtle
    ? (intensity: number) => 4  + intensity * 18
    : (intensity: number) => 6  + intensity * 32;

  const initialNodes: AnimatedNode[] = useMemo(
    () => nodes.map((n) => ({ ...n, tx: n.x, ty: n.y })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [pointer, setPointer]         = useState<{ x: number; y: number } | null>(null);
  const [animatedNodes, setAnimatedNodes] = useState<AnimatedNode[]>(initialNodes);
  const rafRef       = useRef<number | null>(null);
  const targetMapRef = useRef<Map<string, AnimatedNode>>(
    new Map(initialNodes.map((n) => [n.id, n])),
  );
  const sceneRef = useRef<HTMLDivElement | null>(null);

  // Target positions reacting to pointer
  const targetNodes = useMemo(() => {
    if (!pointer) return nodes.map((n) => ({ ...n, tx: n.x, ty: n.y }));
    return nodes.map((n) => {
      const dx   = pointer.x - n.x;
      const dy   = pointer.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= influenceRadius) return { ...n, tx: n.x, ty: n.y };
      const t       = 1 - dist / influenceRadius;
      const attract = Math.pow(t, 1.7) * maxAttract;
      return { ...n, tx: n.x + dx * attract, ty: n.y + dy * attract };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointer]);

  useEffect(() => {
    targetMapRef.current = new Map(targetNodes.map((n) => [n.id, n]));
  }, [targetNodes]);

  // Animation loop
  useEffect(() => {
    const lerp    = 0.14;
    const epsilon = 0.025;
    const tick = () => {
      setAnimatedNodes((prev) => {
        let changed = false;
        const next = prev.map((node) => {
          const target = targetMapRef.current.get(node.id);
          if (!target) return node;
          const dx  = target.tx - node.tx;
          const dy  = target.ty - node.ty;
          const ntx = Math.abs(dx) < epsilon ? target.tx : node.tx + dx * lerp;
          const nty = Math.abs(dy) < epsilon ? target.ty : node.ty + dy * lerp;
          if (ntx !== node.tx || nty !== node.ty) {
            changed = true;
            return { ...node, tx: ntx, ty: nty };
          }
          return node;
        });
        return changed ? next : prev;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const hoveredNodeId = useMemo(() => {
    if (!pointer) return null;
    let winner: { id: string; dist: number } | null = null;
    for (const node of animatedNodes) {
      const dx   = pointer.x - node.tx;
      const dy   = pointer.y - node.ty;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 42 && (!winner || dist < winner.dist)) winner = { id: node.id, dist };
    }
    return winner?.id ?? null;
  }, [pointer, animatedNodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, AnimatedNode>();
    for (const node of animatedNodes) map.set(node.id, node);
    return map;
  }, [animatedNodes]);

  const focusedNode = useMemo(() => {
    if (!pointer) return null;
    let winner: { id: string; intensity: number; dist: number } | null = null;
    for (const node of animatedNodes) {
      const dx   = pointer.x - node.tx;
      const dy   = pointer.y - node.ty;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > blowupRadius) continue;
      const intensity = Math.pow(Math.max(0, 1 - dist / blowupRadius), 1.85);
      if (!winner || dist < winner.dist) winner = { id: node.id, intensity, dist };
    }
    return winner;
  }, [pointer, animatedNodes, blowupRadius]);

  const nodeIntensity = useMemo(() => {
    const map = new Map<string, number>();
    for (const node of animatedNodes) {
      map.set(node.id, focusedNode?.id === node.id ? focusedNode.intensity : 0);
    }
    return map;
  }, [animatedNodes, focusedNode]);

  const backgroundStyle = useMemo((): CSSProperties => {
    const slider = pointer ? (pointer.y / 800) * 100 : 50;
    const stop1  = Math.max(0,   slider - 28);
    const stop2  = Math.min(100, slider + 10);
    const stop3  = Math.min(100, slider + 34);
    return {
      backgroundImage: [
        `linear-gradient(180deg, rgba(4,10,24,0.985) 0%, rgba(7,19,40,0.985) ${stop1}%, rgba(25,124,186,0.2) ${stop2}%, rgba(9,28,58,0.97) ${stop3}%, rgba(3,8,22,0.99) 100%)`,
        "linear-gradient(180deg, rgba(56,189,248,0.08), rgba(34,197,94,0.05) 46%, rgba(2,132,199,0.07))",
      ].join(","),
      backgroundSize:     "100% 100%, 100% 100%",
      backgroundPosition: "center, center",
    };
  }, [pointer]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewW = 1200, viewH = 800;
    const viewRatio = viewW / viewH;
    const rectRatio = rect.width / rect.height;
    let renderW = rect.width, renderH = rect.height, offsetX = 0, offsetY = 0;
    if (rectRatio > viewRatio) { renderW = rect.height * viewRatio; offsetX = (rect.width - renderW) / 2; }
    else                       { renderH = rect.width / viewRatio;  offsetY = (rect.height - renderH) / 2; }
    const localX = Math.min(Math.max(e.clientX - rect.left - offsetX, 0), renderW);
    const localY = Math.min(Math.max(e.clientY - rect.top  - offsetY, 0), renderH);
    setPointer({ x: (localX / renderW) * viewW, y: (localY / renderH) * viewH });
  };

  return (
    <div
      ref={sceneRef}
      className={`min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPointer(null)}
    >
      {/* Hidden spacer to satisfy Next.js image preload warnings */}
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E"
        alt=""
        className="absolute -left-[9999px] h-px w-px"
      />

      {/* Dynamic gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-wave-drift transition-[background-image] duration-200 ease-out opacity-80"
        style={backgroundStyle}
      />

      {/* Node network */}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: svgOpacity }}>
        <svg className="h-full w-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <g fill="none">
            {edges.map((edge) => {
              const from      = nodeMap.get(edge.from);
              const to        = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const intensity = Math.max(
                nodeIntensity.get(edge.from) ?? 0,
                nodeIntensity.get(edge.to)   ?? 0,
              );
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.tx} y1={from.ty}
                  x2={to.tx}   y2={to.ty}
                  stroke={`rgba(125,211,252,${edgeBaseAlpha + intensity * edgeBoostAlpha})`}
                  strokeWidth={0.9 + intensity * 1.5}
                  style={{ transition: "stroke-width 120ms linear, stroke 120ms linear" }}
                />
              );
            })}
          </g>
          {animatedNodes.map((node) => {
            const intensity   = nodeIntensity.get(node.id) ?? 0;
            const active      = node.id === hoveredNodeId || intensity > 0.06;
            const radius      = maxRadius(intensity);
            const iconScale   = 0.72 + intensity * 1.35;
            return (
              <g key={node.id}>
                <circle
                  cx={node.tx} cy={node.ty} r={radius}
                  fill={active ? nodeActiveColor : nodeBaseColor}
                  stroke={active ? "rgba(224,242,254,0.98)" : "transparent"}
                  strokeWidth={active ? 1.5 : 0}
                />
                {active && (
                  <g
                    transform={`translate(${node.tx}, ${node.ty}) scale(${iconScale})`}
                    className="text-sky-50"
                    opacity={Math.min(1, 0.25 + intensity * 1.15)}
                  >
                    {node.icon === "briefcase" && <BriefcaseIcon />}
                    {node.icon === "person"    && <PersonTieIcon />}
                    {node.icon === "resume"    && <ResumeIcon />}
                    {node.icon === "pen"       && <PenIcon />}
                    {node.icon === "school"    && <SchoolIcon />}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Page content */}
      <div className="relative z-10 flex flex-col flex-1">{children}</div>

      <style jsx>{`
        .bg-wave-drift {
          animation: gradientWaveDrift 8s ease-in-out infinite alternate;
        }
        @keyframes gradientWaveDrift {
          0%   { filter: saturate(96%) brightness(98%); transform: translate3d(-0.5%, -0.25%, 0); }
          100% { filter: saturate(100%) brightness(100%); transform: translate3d(0.5%, 0.25%, 0); }
        }
      `}</style>
    </div>
  );
}
