"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Metadata } from "next";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

export default function StudentProfilePage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    university: "",
    degree: "",
    major: "",
    graduationDate: "",
    gpa: "",
    skills: "",
    interests: [] as string[],
    bio: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const [loading, setLoading] = useState(false);

  // Load existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              full_name: data.full_name || "",
              email: data.email || "",
              phone: data.phone || "",
              location: data.location || "",
              university: data.school || "",
              degree: data.degree || "",
              major: data.major || "",
              graduationDate: data.graduation_date || "",
              gpa: data.gpa || "",
              skills: Array.isArray(data.skills)
                ? data.skills.join(", ")
                : data.skills || "",
              interests: data.interests || [],
              bio: data.bio || "",
              linkedin: data.linkedin || "",
              github: data.github || "",
              portfolio: data.portfolio || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Generic handler for inputs/textareas/selects
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox selections for career interests
  const handleInterestChange = (interest: string) => {
    setFormData((prev) => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
  };

  // Submit to API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Profile saved successfully!");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your information to help employers find you
            </p>
          </div>

          {/* Profile Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="john@university.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="New York, NY"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Education
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School / University
                  </label>
                  <input
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your School Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Degree
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select degree level</option>
                    <option value="highschool">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Major / Focus
                  </label>
                  <input
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Graduation Date
                  </label>

                  <DatePicker
                    selected={
                      formData.graduationDate
                        ? new Date(formData.graduationDate)
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        graduationDate: date?.toISOString().split("T")[0] || "",
                      })
                    }
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select graduation date"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose your expected graduation date
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GPA (Optional)
                  </label>
                  <input
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min={0}
                    max={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="3.75"
                  />
                </div>
              </div>
            </section>

            {/* Skills & Interests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Skills & Interests
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technical Skills
                  </label>
                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="JavaScript, Python, React, Node.js, SQL"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Separate skills with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Career Interests
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "Software Engineering",
                      "Data Science",
                      "Product Management",
                      "Marketing",
                      "Design",
                      "Finance",
                      "Consulting",
                      "Sales",
                      "Operations",
                    ].map((interest) => (
                      <label
                        key={interest}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleInterestChange(interest)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell employers about yourself, your goals, and what you're looking for in an internship..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Links & Documents
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub Profile
                  </label>
                  <input
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio Website
                  </label>
                  <input
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
