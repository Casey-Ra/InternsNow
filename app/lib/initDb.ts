import { getAllInternships, createInternship } from "./models/Internship";

// Initial sample data - hardcoded for now
const samples = [
  {
    company_name: "Acme Corp",
    job_description:
      "We are seeking a motivated intern to assist with front-end development, working with React and TypeScript on real product features.",
    url: "https://acme.example.com/careers",
  },
  {
    company_name: "BrightStart Labs",
    job_description:
      "Join our team to work on data engineering tasks, ETL pipelines, and learn best practices for production data systems.",
    url: "https://brightstart.example.com/internships",
  },
  {
    company_name: "GreenField Marketing",
    job_description:
      "Marketing intern wanted to support campaign analytics, social media, and content creation. Great for students studying communications.",
    url: "https://greenfield.example.com/apply",
  },
  {
  company_name: "BlueWave Technologies",
  job_description:
    "Software engineering intern to assist with front-end React development and API integration. Ideal for CS or IT majors.",
  url: "https://bluewave.example.com/internship",
  },
  {
    company_name: "Summit Financial Group",
    job_description:
      "Finance intern needed to support data analysis, budgeting reports, and client presentations. Excel experience preferred.",
    url: "https://summitfg.example.com/careers",
  },
  {
    company_name: "EcoUrban Design",
    job_description:
      "Architecture and sustainability intern to aid in drafting eco-friendly building plans using AutoCAD and Revit.",
    url: "https://ecourban.example.com/jobs",
  },
  {
    company_name: "Nova Health Analytics",
    job_description:
      "Data science intern to analyze healthcare datasets and develop visual dashboards using Python and Tableau.",
    url: "https://novahealth.example.com/apply",
  },
  {
    company_name: "Lumen Media",
    job_description:
      "Video production intern to assist with editing, motion graphics, and lighting setup for digital campaigns.",
    url: "https://lumenmedia.example.com/intern",
  },
  {
    company_name: "IronClad Security",
    job_description:
      "Cybersecurity intern to monitor network vulnerabilities and assist with penetration testing exercises.",
    url: "https://ironcladsec.example.com/internship",
  },
  {
    company_name: "Horizon Robotics",
    job_description:
      "AI research intern to support model training, dataset curation, and testing autonomous navigation algorithms.",
    url: "https://horizonrobotics.example.com/apply",
  },
  {
    company_name: "SilverLine Logistics",
    job_description:
      "Operations intern responsible for optimizing supply chain data, shipment tracking, and inventory reports.",
    url: "https://silverline.example.com/intern",
  },
  {
    company_name: "Aurora Publishing",
    job_description:
      "Editorial intern to proofread manuscripts, draft promotional copy, and support author correspondence.",
    url: "https://aurorapub.example.com/apply",
  },
  {
    company_name: "NextGen Energy",
    job_description:
      "Engineering intern to assist in renewable energy feasibility studies and solar system design analysis.",
    url: "https://nextgenenergy.example.com/careers",
  },
  {
    company_name: "BrightPath Education",
    job_description:
      "Education intern to develop tutoring materials, coordinate online workshops, and support curriculum innovation.",
    url: "https://brightpath.example.com/internship",
  },

];

// Run initialization asynchronously on module import. This is idempotent: it only inserts when the table is empty.
(async function initDb() {
  try {
    const existing = await getAllInternships();
    if (existing.length > 0) {
      // Already populated; skip
      return;
    }

    console.log("Initializing internships table with sample data...");

    for (const s of samples) {
      try {
        await createInternship(s.company_name, s.job_description, s.url);
      } catch (err) {
        console.error("Failed to create sample internship", s.company_name, err);
      }
    }

    console.log("Initialization complete.");
  } catch (err) {
    console.error("Error checking/initializing internships:", err);
  }
})();
