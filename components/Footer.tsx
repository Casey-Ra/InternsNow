import Link from "next/link";

interface FooterProps {
  variant?: "student" | "employer" | "default";
}

export default function Footer({ variant = "default" }: FooterProps) {
  const getThemeColor = () => {
    switch (variant) {
      case "student":
        return "hover:text-blue-600";
      case "employer":
        return "hover:text-green-600";
      default:
        return "hover:text-blue-600";
    }
  };

  const hoverColor = getThemeColor();

  const getLinks = () => {
    const baseLinks = {
      company: [
        { href: "#", label: "About Us" },
        { href: "#", label: "Contact" },
        { href: "#", label: "Privacy Policy" },
        { href: "#", label: "Terms of Service" },
      ],
      support: [
        { href: "#", label: "Help Center" },
        { href: "#", label: "FAQs" },
        { href: "#", label: "Community" },
        { href: "#", label: "Feedback" },
      ],
    };

    const specificLinks = {
      student: [
        { href: "#", label: "Browse Jobs" },
        { href: "#", label: "Career Resources" },
        { href: "#", label: "Resume Builder" },
        { href: "#", label: "Interview Prep" },
      ],
      employer: [
        { href: "#", label: "Post Jobs" },
        { href: "#", label: "Search Candidates" },
        { href: "#", label: "Pricing" },
        { href: "#", label: "Success Stories" },
      ],
    };

    return {
      specific:
        variant === "default"
          ? baseLinks.company
          : specificLinks[variant as keyof typeof specificLinks],
      company: baseLinks.company,
      support: baseLinks.support,
    };
  };

  const links = getLinks();
  const specificTitle =
    variant === "student"
      ? "For Students"
      : variant === "employer"
        ? "For Employers"
        : "Company";

  return (
    <footer className="px-6 py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IN</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                InternsNow
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300">
              {variant === "employer"
                ? "The premier platform for connecting employers with exceptional student talent."
                : "Connecting students with their dream internships and first jobs."}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              {specificTitle}
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {links.specific.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={hoverColor}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={hoverColor}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {links.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={hoverColor}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 InternsNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
