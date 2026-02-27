// app/student/profile/view/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface EducationRow {
  eduId: number;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  description?: string | null;
  institution?: { institutionId: number; name: string | null } | null;
  degreeType?: {
    degreeTypeId: number;
    type: string | null;
    abbreviation: string | null;
    level: string | null;
  } | null;
  majors: {
    userMajorId: number;
    name: string | null;
    isPrimary: boolean | null;
  }[];
}

interface WorkRow {
  workId: number;
  company: string;
  position: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean | null;
  city?: string | null;
  state?: { id: number; code: string; name: string } | null;
  country?: { id: number; code: string; name: string } | null;
}

interface ProfileResponse {
  authenticated: boolean;
  userId: number;
  fullName: string;
  email: string;
  education: EducationRow[];
  workExperience: WorkRow[];
}

/** ---------- small helpers ---------- */
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeText(v?: string | null, fallback = "—") {
  const s = (v ?? "").trim();
  return s ? s : fallback;
}

function parseDate(input?: string | null) {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatMonthYear(input?: string | null) {
  const d = parseDate(input);
  if (!d) return null;
  return d.toLocaleString(undefined, { month: "short", year: "numeric" });
}

function formatRange(
  start?: string | null,
  end?: string | null,
  current?: boolean | null,
) {
  const s = formatMonthYear(start);
  const e = current ? "Present" : formatMonthYear(end);
  if (!s && !e) return null;
  if (s && e) return `${s} • ${e}`;
  return s ?? e ?? null;
}

function initials(fullName?: string | null) {
  const s = (fullName ?? "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200">
      {children}
    </span>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-medium text-gray-100">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{message}</p>
      <div className="mt-4">
        <Link
          href="/student/profile/edit"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
        >
          Edit profile
        </Link>
      </div>
    </div>
  );
}

function TimelineCard({
  title,
  subtitle,
  meta,
  body,
  rightTag,
}: {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  body?: string | null;
  rightTag?: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-100 truncate">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-200">{subtitle}</p>
          ) : null}
          {meta ? <p className="mt-1 text-xs text-gray-400">{meta}</p> : null}
        </div>
        {rightTag ? <div className="shrink-0">{rightTag}</div> : null}
      </div>

      {body ? (
        <p className="mt-3 text-sm leading-relaxed text-gray-300 whitespace-pre-line">
          {body}
        </p>
      ) : null}
    </div>
  );
}

export default function ViewProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const derived = useMemo(() => {
    if (!profile) return null;

    // Education: pick the "best" row to summarize (prefer ones with endDate null / most recent)
    const eduSorted = [...(profile.education ?? [])].sort((a, b) => {
      const aEnd =
        parseDate(a.endDate)?.getTime() ??
        (a.endDate ? 0 : Number.MAX_SAFE_INTEGER);
      const bEnd =
        parseDate(b.endDate)?.getTime() ??
        (b.endDate ? 0 : Number.MAX_SAFE_INTEGER);
      return bEnd - aEnd;
    });
    const topEdu = eduSorted[0] ?? null;

    const majors = topEdu?.majors ?? [];
    const primaryMajor = majors.find((m) => m.isPrimary) ?? majors[0] ?? null;

    const degree =
      topEdu?.degreeType?.abbreviation ?? topEdu?.degreeType?.type ?? null;

    const institution = topEdu?.institution?.name ?? null;
    const eduStatus = topEdu?.status ?? null;
    const eduRange = topEdu
      ? formatRange(topEdu.startDate, topEdu.endDate, false)
      : null;

    // Work: current if any, else most recent end date
    const workSorted = [...(profile.workExperience ?? [])].sort((a, b) => {
      const aScore = a.current
        ? Number.MAX_SAFE_INTEGER
        : (parseDate(a.endDate)?.getTime() ?? 0);
      const bScore = b.current
        ? Number.MAX_SAFE_INTEGER
        : (parseDate(b.endDate)?.getTime() ?? 0);
      return bScore - aScore;
    });
    const topWork = workSorted[0] ?? null;

    const loc = topWork
      ? [topWork.city, topWork.state?.code, topWork.country?.code]
          .filter(Boolean)
          .join(", ")
      : null;

    // Headline
    const headlineParts = [
      degree && primaryMajor?.name
        ? `${degree} • ${primaryMajor.name}`
        : (degree ?? primaryMajor?.name ?? null),
      institution ? `@ ${institution}` : null,
    ].filter(Boolean);

    const headline = headlineParts.join(" ");

    return {
      topEdu,
      topWork,
      primaryMajor: primaryMajor?.name ?? null,
      degreeLevel: topEdu?.degreeType?.level ?? null,
      degree,
      institution,
      eduStatus,
      eduRange,
      workTitle: topWork ? `${topWork.position} @ ${topWork.company}` : null,
      workRange: topWork
        ? formatRange(topWork.startDate, topWork.endDate, topWork.current)
        : null,
      location: loc,
      headline: headline || null,
      initials: initials(profile.fullName),
    };
  }, [profile]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-gray-300">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!profile || profile.authenticated === false) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-gray-300">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-base font-semibold text-gray-100">
            No profile found
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Add your education and experience so employers can see a complete
            profile.
          </p>
          <div className="mt-4">
            <Link
              href="/student/profile/edit"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
            >
              Create / Edit profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10 text-gray-100">
      <div className="mx-auto max-w-6xl">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5">
          {/* soft “cover” */}
          <div className="absolute inset-0 opacity-50">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-emerald-500/20" />
          </div>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0">
                  <Image
                    src="/default-avatar.png"
                    alt="Profile"
                    fill
                    className="rounded-full border-4 border-blue-500/80 object-cover bg-gray-900"
                    priority
                  />
                  {/* fallback initials overlay if your default avatar is missing */}
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-black/0 flex items-center justify-center">
                    <span className="text-transparent select-none">
                      {derived?.initials}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                    {safeText(profile.fullName, "Student")}
                  </h1>
                  <p className="mt-1 text-sm text-gray-300 truncate">
                    {safeText(profile.email, "")}
                  </p>
                  {derived?.headline ? (
                    <p className="mt-2 text-sm text-gray-200/90">
                      {derived.headline}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">
                      Add education and experience to build your profile.
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:ml-auto flex flex-wrap items-center gap-2">
                {derived?.primaryMajor ? (
                  <Badge>Major: {derived.primaryMajor}</Badge>
                ) : null}
                {derived?.degreeLevel ? (
                  <Badge>Level: {derived.degreeLevel}</Badge>
                ) : null}
                {derived?.eduStatus ? (
                  <Badge>Status: {derived.eduStatus}</Badge>
                ) : null}
                {derived?.location ? <Badge>{derived.location}</Badge> : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                {derived?.workTitle ? (
                  <span className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                    <span className="text-gray-400">Currently: </span>
                    <span className="text-gray-200">{derived.workTitle}</span>
                    {derived.workRange ? (
                      <span className="text-gray-400">
                        {" "}
                        • {derived.workRange}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-gray-400">
                    No work experience listed yet
                  </span>
                )}

                {derived?.eduRange ? (
                  <span className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                    <span className="text-gray-400">Education: </span>
                    <span className="text-gray-200">{derived.eduRange}</span>
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/student/profile/edit"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                >
                  Edit profile
                </Link>
                <Link
                  href="/student/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-100 hover:bg-white/10 transition"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BODY GRID */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Education */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <SectionTitle
                title="Education"
                subtitle="Schools, degrees, majors, and relevant details."
              />

              <div className="mt-4 space-y-4">
                {profile.education.length === 0 ? (
                  <EmptyState
                    title="No education added"
                    message="Add your school, degree type, and majors to make your profile more credible."
                  />
                ) : (
                  profile.education.map((e) => {
                    const majors = e.majors ?? [];
                    const primaryMajor =
                      majors.find((m) => m.isPrimary) ?? majors[0] ?? null;

                    const degree =
                      e.degreeType?.abbreviation ??
                      e.degreeType?.type ??
                      "Degree";

                    const subtitleParts = [
                      degree,
                      primaryMajor?.name ? `• ${primaryMajor.name}` : null,
                    ].filter(Boolean);

                    const metaParts = [
                      formatRange(e.startDate, e.endDate, false),
                      e.status ? `Status: ${e.status}` : null,
                    ].filter(Boolean);

                    const rightTag =
                      e.status?.toLowerCase().includes("current") ||
                      e.status?.toLowerCase().includes("enrolled") ? (
                        <Badge>Active</Badge>
                      ) : null;

                    return (
                      <TimelineCard
                        key={e.eduId}
                        title={safeText(
                          e.institution?.name,
                          "Unknown Institution",
                        )}
                        subtitle={subtitleParts.join(" ")}
                        meta={metaParts.join(" • ") || null}
                        body={e.description ?? null}
                        rightTag={rightTag}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Work */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <SectionTitle
                title="Work Experience"
                subtitle="Roles, responsibilities, and impact."
              />

              <div className="mt-4 space-y-4">
                {profile.workExperience.length === 0 ? (
                  <EmptyState
                    title="No work experience added"
                    message="Add jobs, internships, or campus roles. Even part-time work helps employers understand your strengths."
                  />
                ) : (
                  profile.workExperience.map((w) => {
                    const loc = [w.city, w.state?.code, w.country?.code]
                      .filter(Boolean)
                      .join(", ");

                    const metaParts = [
                      formatRange(w.startDate, w.endDate, w.current),
                      loc ? `Location: ${loc}` : null,
                    ].filter(Boolean);

                    const rightTag = w.current ? <Badge>Current</Badge> : null;

                    return (
                      <TimelineCard
                        key={w.workId}
                        title={safeText(w.company, "Company")}
                        subtitle={safeText(w.position, "Role")}
                        meta={metaParts.join(" • ") || null}
                        body={w.description ?? null}
                        rightTag={rightTag}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <SectionTitle
                title="Profile Summary"
                subtitle="Quick snapshot."
              />

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-400">Primary major</p>
                  <p className="text-gray-100 text-right">
                    {safeText(derived?.primaryMajor, "Not set")}
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-400">Degree</p>
                  <p className="text-gray-100 text-right">
                    {safeText(derived?.degree, "Not set")}
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-400">Institution</p>
                  <p className="text-gray-100 text-right">
                    {safeText(derived?.institution, "Not set")}
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-400">Current role</p>
                  <p className="text-gray-100 text-right">
                    {safeText(derived?.workTitle, "Not set")}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-400">Completeness</p>
                  <div className="mt-2">
                    {(() => {
                      const hasEdu = profile.education.length > 0;
                      const hasWork = profile.workExperience.length > 0;
                      const hasName =
                        (profile.fullName ?? "").trim().length > 0;
                      const score = [hasName, hasEdu, hasWork].filter(
                        Boolean,
                      ).length;
                      const pct = Math.round((score / 3) * 100);

                      return (
                        <>
                          <div className="h-2 rounded-full bg-black/20 border border-white/10 overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            {pct}% complete — add more details to improve
                            matching quality.
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <SectionTitle
                title="Next Steps"
                subtitle="Make this profile stand out."
              />
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                  Add a short “About” / summary (future: profile bio field).
                </li>
                <li className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                  Include measurable impact in work descriptions (numbers help).
                </li>
                <li className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
                  Add multiple majors/minors and mark a primary major.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
