import { NextResponse } from "next/server";

const MAJORS = [
  // Business
  "Accounting",
  "Actuarial Science",
  "Business Administration",
  "Business Analytics",
  "Economics",
  "Entrepreneurship",
  "Finance",
  "Human Resources Management",
  "International Business",
  "Logistics & Supply Chain Management",
  "Management",
  "Management Information Systems",
  "Marketing",
  "Operations Management",
  "Real Estate",
  "Risk Management & Insurance",
  // STEM - Computer & Technology
  "Artificial Intelligence",
  "Bioinformatics",
  "Computer Engineering",
  "Computer Science",
  "Cybersecurity",
  "Data Science",
  "Game Design & Development",
  "Human-Computer Interaction",
  "Information Science",
  "Information Technology",
  "Software Engineering",
  "Web Development",
  // STEM - Engineering
  "Aerospace Engineering",
  "Biomedical Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Environmental Engineering",
  "Industrial Engineering",
  "Materials Science & Engineering",
  "Mechanical Engineering",
  "Nuclear Engineering",
  "Petroleum Engineering",
  "Systems Engineering",
  // STEM - Sciences
  "Biochemistry",
  "Biology",
  "Chemistry",
  "Earth Science",
  "Environmental Science",
  "Genetics",
  "Mathematics",
  "Microbiology",
  "Neuroscience",
  "Physics",
  "Psychology",
  "Statistics",
  // Health & Medicine
  "Athletic Training",
  "Dietetics & Nutrition",
  "Exercise Science",
  "Health Administration",
  "Health Informatics",
  "Kinesiology",
  "Nursing",
  "Occupational Therapy",
  "Pharmacy",
  "Physical Therapy",
  "Pre-Dentistry",
  "Pre-Medicine",
  "Pre-Veterinary",
  "Public Health",
  "Radiologic Technology",
  "Respiratory Therapy",
  "Speech-Language Pathology",
  // Social Sciences & Humanities
  "Anthropology",
  "Communication Studies",
  "Criminal Justice",
  "English",
  "Geography",
  "History",
  "International Relations",
  "Journalism",
  "Linguistics",
  "Philosophy",
  "Political Science",
  "Public Administration",
  "Public Relations",
  "Religious Studies",
  "Social Work",
  "Sociology",
  // Arts & Design
  "Architecture",
  "Art History",
  "Digital Media",
  "Fashion Design",
  "Film & Media Studies",
  "Graphic Design",
  "Industrial Design",
  "Interior Design",
  "Music",
  "Music Business",
  "Performing Arts",
  "Photography",
  "Theatre",
  "Visual Arts",
  // Education
  "Early Childhood Education",
  "Education",
  "Elementary Education",
  "Secondary Education",
  "Special Education",
  // Other
  "Agriculture",
  "Aviation",
  "Construction Management",
  "Culinary Arts",
  "Environmental Studies",
  "Foreign Language",
  "Forestry",
  "Hospitality Management",
  "Landscape Architecture",
  "Legal Studies",
  "Library Science",
  "Military Science",
  "Parks & Recreation Management",
  "Urban Planning",
  "Women's & Gender Studies",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const matches = MAJORS
    .filter((m) => m.toLowerCase().includes(q))
    .slice(0, 20)
    .map((name, i) => ({ id: i + 1, name }));

  return NextResponse.json(matches);
}
