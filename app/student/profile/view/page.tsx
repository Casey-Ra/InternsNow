// app/student/profile/view/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Profile {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  school?: string;
  degree?: string;
  major?: string;
  graduationDate?: string;
  gpa?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  profileImage?: string;
}

export default function ViewProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 404) return null; // profile doesn't exist yet
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen text-gray-300">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex justify-center items-center h-screen text-gray-400">
        <p>No profile found. Try editing your profile to add information.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-6 text-gray-100">
      {/* Profile Card */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Image
            src={profile.profileImage || "/default-avatar.png"}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full border-4 border-blue-500"
          />

          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-400">{profile.email}</p>
            <p className="text-gray-400">{profile.location}</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-700" />

        {/* Education */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-blue-400 mb-2">
            Education
          </h2>
          <p>
            {profile.school} — {profile.degree}
          </p>
          <p>{profile.major}</p>
          {profile.graduationDate && (
            <p className="text-gray-400">
              Expected Graduation: {profile.graduationDate}
            </p>
          )}
          {profile.gpa && <p>GPA: {profile.gpa}</p>}
        </section>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-blue-600/20 border border-blue-600 text-blue-300 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span
                  key={i}
                  className="bg-purple-600/20 border border-purple-600 text-purple-300 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Bio */}
        {profile.bio && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">
              About Me
            </h2>
            <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
          </section>
        )}

        {/* Links */}
        <section className="flex flex-wrap gap-4 mt-8">
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              LinkedIn
            </a>
          )}
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:underline"
            >
              GitHub
            </a>
          )}
          {profile.portfolio && (
            <a
              href={profile.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline"
            >
              Portfolio
            </a>
          )}
        </section>
      </div>
    </main>
  );
}
