import pool from "@/lib/db";

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  details: string;
  host: string;
  price: string;
  registrationLink: string;
  tags: string[];
};

const sampleEvents: EventItem[] = [
  {
    id: "evt-001",
    title: "Grow Your Circle: Tech Mixer",
    date: "Thu, Feb 20",
    time: "6:00 PM - 8:00 PM",
    location: "Downtown Innovation Hub",
    description:
      "Meet local founders, engineers, and product teams. Short talks at 6:30 PM.",
    details:
      "Arrive by 6:00 PM for open networking. Lightning talks start at 6:30 PM. Bring a resume or portfolio link to share.",
    host: "City Tech Alliance",
    price: "Free",
    registrationLink: "https://example.com/tech-mixer",
    tags: ["Tech", "Networking", "Startups"],
  },
  {
    id: "evt-002",
    title: "AI & Data Networking Night",
    date: "Tue, Feb 25",
    time: "5:30 PM - 7:30 PM",
    location: "City Library Auditorium",
    description:
      "Connect with data professionals, explore career paths, and get resume feedback.",
    details:
      "Panel discussion at 5:45 PM, followed by curated breakout circles for analytics, ML, and data engineering.",
    host: "Data Society",
    price: "$5 student ticket",
    registrationLink: "https://example.com/ai-data-night",
    tags: ["AI", "Data", "Careers"],
  },
  {
    id: "evt-003",
    title: "Design + Product Community Meetup",
    date: "Sat, Mar 1",
    time: "10:00 AM - 12:00 PM",
    location: "Riverside Co-Working",
    description:
      "Lightning talks from PMs and designers, followed by roundtable networking.",
    details:
      "Bring a case study or product teardown to discuss. Coffee and snacks provided.",
    host: "Product Guild",
    price: "Free",
    registrationLink: "https://example.com/design-product",
    tags: ["Design", "Product", "Community"],
  },
  {
    id: "evt-004",
    title: "Finance & Consulting Career Social",
    date: "Wed, Mar 5",
    time: "6:00 PM - 8:30 PM",
    location: "Union Hall",
    description:
      "Chat with analysts and consultants, learn about summer internship timelines.",
    details:
      "Fireside chat at 6:15 PM. Resume review tables open from 7:00 PM to 8:00 PM.",
    host: "Future Finance Network",
    price: "Free with RSVP",
    registrationLink: "https://example.com/finance-consulting",
    tags: ["Finance", "Consulting", "Careers"],
  },
  {
    id: "evt-005",
    title: "Startup Pitch + Student Networking",
    date: "Fri, Mar 7",
    time: "4:00 PM - 6:00 PM",
    location: "Campus Center Room 204",
    description:
      "Local startups pitch for interns. Great place to get introduced and follow up.",
    details:
      "Pitch session from 4:10 PM to 5:00 PM, then direct networking with founders.",
    host: "Campus Venture Lab",
    price: "Free",
    registrationLink: "https://example.com/startup-pitch",
    tags: ["Startups", "Internships", "Networking"],
  },
];

export async function getEvents(): Promise<EventItem[]> {
  try {
    const result = await pool.query(
      `SELECT id, title, date, time, location, description, details, host, price, registration_link, tags
       FROM events
       ORDER BY created_at DESC`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      description: row.description,
      details: row.details,
      host: row.host,
      price: row.price,
      registrationLink: row.registration_link,
      tags: Array.isArray(row.tags) ? row.tags : [],
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return sampleEvents;
  }
}

export async function findEventById(id: string) {
  try {
    const result = await pool.query(
      `SELECT id, title, date, time, location, description, details, host, price, registration_link, tags
       FROM events
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (result.rowCount === 0) {
      return sampleEvents.find((event) => event.id === id);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      description: row.description,
      details: row.details,
      host: row.host,
      price: row.price,
      registrationLink: row.registration_link,
      tags: Array.isArray(row.tags) ? row.tags : [],
    } as EventItem;
  } catch (error) {
    console.error("Error fetching event by id:", error);
    return sampleEvents.find((event) => event.id === id);
  }
}
