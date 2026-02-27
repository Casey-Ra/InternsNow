// app/student/profile/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

import { InstitutionAutocomplete } from "@/components/InstitutionAutocomplete";
import { MajorAutocomplete } from "@/components/MajorAutocomplete";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

type DegreeType = {
  degree_type_id: number;
  type: string | null;
  abbreviation: string | null;
  level: string | null;
};

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;

  university: string; // institution_id as string
  degree: string; // degree_type_id as string
  major: string; // major name
  graduationDate: string; // yyyy-mm-dd
  gpa: string;

  skills: string;
  interests: string[];
  bio: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

function isoDateOrEmpty(date: Date | null) {
  return date ? date.toISOString().split("T")[0] : "";
}

// Split "John A Doe" -> first="John", last="A Doe"
function splitName(fullName?: string | null) {
  const s = (fullName ?? "").trim();
  if (!s) return { first: "", last: "" };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

const INTERESTS = [
  "Software Engineering",
  "Data Science",
  "Product Management",
  "Marketing",
  "Design",
  "Finance",
  "Consulting",
  "Sales",
  "Operations",
] as const;

// Small UI helpers (kept inside the page for easy try-out)
function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur flex items-center justify-center shadow-sm">
          <span className="text-lg">{icon ?? "•"}</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {/* Accent line */}
      <div className="hidden sm:block h-10 w-32 rounded-full bg-gradient-to-r from-blue-500/40 via-indigo-500/30 to-transparent" />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {required ? (
          <span className="text-xs rounded-full px-2 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-200 border border-blue-500/20">
            Required
          </span>
        ) : null}
      </div>
      {children}
      {hint ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl px-4 py-3 border bg-white/70 dark:bg-white/5 backdrop-blur " +
  "border-gray-200/70 dark:border-white/10 text-gray-900 dark:text-white " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 " +
  "transition";

const buttonPrimary =
  "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold " +
  "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm " +
  "hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition disabled:opacity-50";

const buttonGhost =
  "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold " +
  "border border-gray-200/70 dark:border-white/10 text-gray-700 dark:text-gray-200 " +
  "bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition";

function Chip({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition border",
        selected
          ? "bg-blue-600 text-white border-blue-500/50 shadow-sm"
          : "bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-200 border-gray-200/70 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10",
      ].join(" ")}
    >
      <span className="text-xs">{selected ? "✓" : "+"}</span>
      {children}
    </button>
  );
}

export default function StudentProfilePage() {
  const [formData, setFormData] = useState<FormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",

    university: "",
    degree: "",
    major: "",
    graduationDate: "",
    gpa: "",

    skills: "",
    interests: [],
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const [loading, setLoading] = useState(false);

  const [selectedInstitutionName, setSelectedInstitutionName] =
    useState<string>("");

  const [degreeTypes, setDegreeTypes] = useState<DegreeType[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);

  // Load degree types
  useEffect(() => {
    const loadLookups = async () => {
      setLookupsLoading(true);
      try {
        const degRes = await fetch("/api/lookups/degree-types", {
          credentials: "include",
        });
        if (degRes.ok) setDegreeTypes(await degRes.json());
      } catch (err) {
        console.error("Lookup load error:", err);
      } finally {
        setLookupsLoading(false);
      }
    };
    loadLookups();
  }, []);

  // Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (!res.ok) return;

        const data = await res.json();
        if (!data || data.authenticated === false) return;

        const edu0 =
          Array.isArray(data.education) && data.education.length > 0
            ? data.education[0]
            : null;

        const primaryMajor =
          edu0?.majors?.find((m: any) => m?.isPrimary) ??
          edu0?.majors?.[0] ??
          null;

        const { first, last } = splitName(data.fullName);

        setFormData((prev) => ({
          ...prev,
          first_name: first || prev.first_name,
          last_name: last || prev.last_name,
          email: data.email ?? prev.email,

          university: edu0?.institution?.institutionId
            ? String(edu0.institution.institutionId)
            : "",
          degree: edu0?.degreeType?.degreeTypeId
            ? String(edu0.degreeType.degreeTypeId)
            : "",
          major: primaryMajor?.name ?? "",

          phone: data.phone ?? "",
          location: data.location ?? "",
          graduationDate: edu0?.endDate ?? "",
          gpa: "",

          skills: Array.isArray(data.skills)
            ? data.skills.join(", ")
            : (data.skills ?? ""),
          interests: Array.isArray(data.interests) ? data.interests : [],
          bio: data.bio ?? "",
          linkedin: data.linkedin ?? "",
          github: data.github ?? "",
          portfolio: data.portfolio ?? "",
        }));

        setSelectedInstitutionName(edu0?.institution?.name ?? "");
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
  };

  // Simple “profile completeness”
  const completion = useMemo(() => {
    const checks = [
      !!formData.first_name.trim() && !!formData.last_name.trim(),
      !!formData.email.trim(),
      !!formData.location.trim(),
      !!formData.phone.trim(),
      !!formData.university.trim(),
      !!formData.degree.trim(),
      !!formData.major.trim(),
      !!formData.graduationDate.trim(),
      (formData.skills ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length >= 3,
      formData.interests.length >= 2,
      (formData.bio ?? "").trim().length >= 40,
      !!formData.linkedin.trim() ||
        !!formData.github.trim() ||
        !!formData.portfolio.trim(),
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        fullName: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        phone: formData.phone,
        location: formData.location,

        education: [
          {
            institutionId: formData.university
              ? Number(formData.university)
              : null,
            degreeTypeId: formData.degree ? Number(formData.degree) : null,

            startDate: null,
            endDate: formData.graduationDate ? formData.graduationDate : null,
            status: null,
            description: null,

            majors: formData.major
              ? [{ name: formData.major.trim(), isPrimary: true }]
              : [],
          },
        ],

        workExperience: [],
        skills: (formData.skills ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        interests: formData.interests,
        bio: formData.bio,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Profile saved successfully!");
      } else {
        alert("❌ Failed to save profile.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900" />
      <div className="absolute -z-10 left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -z-10 right-[-10%] top-[20%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <Header variant="student" />

      <main className="px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Title + completion */}
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  My Profile
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Manage your information to help employers find you
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Profile completion: {completion}%
                </span>
                <div className="mt-2 h-2 w-40 rounded-full bg-gray-200/70 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile completion */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                <span className="font-medium">Profile completion</span>
                <span>{completion}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200/70 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          <form className="space-y-8 pb-24" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card>
              <SectionHeader
                title="Basic Information"
                subtitle="These help employers contact you quickly."
                icon="👤"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <Field label="First Name" required>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className={inputBase}
                    placeholder="John"
                  />
                </Field>

                <Field label="Last Name" required>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className={inputBase}
                    placeholder="Doe"
                  />
                </Field>

                <Field label="Email" required>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputBase}
                    placeholder="john@university.edu"
                  />
                </Field>

                <Field label="Phone Number">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="(555) 123-4567"
                  />
                </Field>

                <Field label="Location" hint="City, State (or City, Country)">
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={(next) =>
                      setFormData((p) => ({ ...p, location: next }))
                    }
                    onSelect={(it) =>
                      setFormData((p) => ({ ...p, location: it.label }))
                    }
                    placeholder="New York, NY"
                    className={inputBase}
                  />
                </Field>
              </div>
            </Card>

            {/* Education */}
            <Card>
              <SectionHeader
                title="Education"
                subtitle="Add your university and degree details."
                icon="🎓"
              />

              <div className="grid md:grid-cols-2 gap-6">
                {/* School / University (typeahead) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    School / University
                  </label>
                  <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-2 py-2">
                    <InstitutionAutocomplete
                      selectedId={formData.university}
                      selectedLabel={selectedInstitutionName}
                      onSelect={(it) => {
                        setFormData((prev) => ({
                          ...prev,
                          university: String(it.id),
                        }));
                        setSelectedInstitutionName(it.name);
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Start typing to search.
                  </p>
                </div>

                {/* Degree Type */}
                <Field label="Degree Type">
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className={inputBase}
                  >
                    <option value="">
                      {lookupsLoading
                        ? "Loading degree types..."
                        : "Select degree type"}
                    </option>
                    {degreeTypes.map((d) => {
                      const label = [
                        d.abbreviation ||
                          d.type ||
                          `Degree ${d.degree_type_id}`,
                        d.level,
                      ]
                        .filter(Boolean)
                        .join(" • ");
                      return (
                        <option key={d.degree_type_id} value={d.degree_type_id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </Field>

                {/* Major */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Major / Focus
                  </label>
                  <div className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-2 py-2">
                    <MajorAutocomplete
                      selectedLabel={formData.major}
                      onSelect={(it) => {
                        setFormData((prev) => ({ ...prev, major: it.name }));
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Start typing to search.
                  </p>
                </div>

                {/* Graduation Date */}
                <Field
                  label="Graduation Date"
                  hint="Choose your expected graduation date."
                >
                  <DatePicker
                    selected={
                      formData.graduationDate
                        ? new Date(formData.graduationDate)
                        : null
                    }
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        graduationDate: isoDateOrEmpty(date),
                      }))
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select graduation date"
                    className={inputBase}
                  />
                </Field>

                {/* GPA */}
                <div className="md:col-span-2">
                  <Field label="GPA (Optional)" hint="Scale: 0.00 – 4.00">
                    <input
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleChange}
                      type="number"
                      step="0.01"
                      min={0}
                      max={4}
                      className={inputBase}
                      placeholder="3.75"
                    />
                  </Field>
                </div>
              </div>
            </Card>

            {/* Skills & Interests */}
            <Card>
              <SectionHeader
                title="Skills & Interests"
                subtitle="These help matching and discovery."
                icon="🧠"
              />

              <div className="space-y-6">
                <Field
                  label="Technical Skills"
                  hint="Separate skills with commas. (Try 3+ skills for better matches.)"
                >
                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    type="text"
                    className={inputBase}
                    placeholder="JavaScript, Python, React, Node.js, SQL"
                  />
                </Field>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Career Interests
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Pick a few
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => (
                      <Chip
                        key={interest}
                        selected={formData.interests.includes(interest)}
                        onClick={() => handleInterestChange(interest)}
                      >
                        {interest}
                      </Chip>
                    ))}
                  </div>
                </div>

                <Field
                  label="Bio"
                  hint="Aim for 2–3 sentences. Mention what roles you want + what you’ve built."
                >
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    className={inputBase + " resize-y"}
                    placeholder="Tell employers about yourself..."
                  />
                </Field>
              </div>
            </Card>

            {/* Links */}
            <Card>
              <SectionHeader
                title="Links & Documents"
                subtitle="Add your public work to build trust fast."
                icon="🔗"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <Field label="LinkedIn Profile">
                  <input
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    type="url"
                    className={inputBase}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </Field>

                <Field label="GitHub Profile">
                  <input
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    type="url"
                    className={inputBase}
                    placeholder="https://github.com/yourusername"
                  />
                </Field>

                <Field label="Portfolio Website">
                  <input
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    type="url"
                    className={inputBase}
                    placeholder="https://yourportfolio.com"
                  />
                </Field>
              </div>
            </Card>

            {/* (Optional) Keep old buttons for non-sticky contexts */}
            <div className="hidden sm:flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={buttonGhost}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={buttonPrimary}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Sticky action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-950/40 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 rounded-full bg-gray-200/80 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {completion}% complete
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                Tip: add 3+ skills + a short bio for better matching.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={buttonGhost}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  const form = document.querySelector("form");
                  if (form) form.requestSubmit();
                }}
                className={buttonPrimary}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
