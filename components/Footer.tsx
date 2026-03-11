import Link from "next/link";

interface FooterProps {
  variant?: "student" | "employer" | "default";
  tone?: "light" | "dark";
}

export default function Footer({
  variant = "default",
  tone = "light",
}: FooterProps) {
  const getThemeColor = () => {
    if (tone === "dark") {
      return "hover:text-sky-200";
    }

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
  const isDarkTone = tone === "dark";
  const borderClass = isDarkTone ? "border-slate-800" : "border-gray-200";
  const headingClass = isDarkTone ? "text-slate-100" : "text-gray-900";
  const bodyClass = isDarkTone ? "text-slate-300" : "text-gray-600";
  const disabledClass = isDarkTone
    ? "text-slate-500 cursor-not-allowed"
    : "text-gray-400 cursor-not-allowed";
  const copyrightClass = isDarkTone ? "text-slate-400" : "text-gray-600";

  const getLinks = () => {
    const baseLinks = {
      company: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms-of-service", label: "Terms of Service" },
      ],
      support: [
        { href: "/help-center", label: "Help Center" },
        { href: "/faqs", label: "FAQs" },
        { href: "/community", label: "Community" },
        { href: "/feedback", label: "Feedback" },
      ],
    };

    const specificLinks = {
      student: [
        { href: "/student/find-opportunities", label: "Find Opportunities" },
        { href: "/student/career-resources", label: "Career Resources" },
        { href: "/student/resume", label: "Resume Builder" },
        { href: "/student/interview", label: "AI Interview" },
        { href: "/student/fluency-test", label: "AI Fluency Test" },
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
          ? []
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
    <footer className={`px-6 py-8 mt-16 border-t ${borderClass}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid ${links.specific.length > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-8`}>
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IN</span>
              </div>
              <span className={`text-xl font-bold ${headingClass}`}>
                InternsNow
              </span>
            </Link>
            <p className={bodyClass}>
              {variant === "employer"
                ? "The premier platform for connecting employers with exceptional student talent."
                : "Connecting students with their dream internships and first jobs."}
            </p>
          </div>

          {links.specific.length > 0 && (
            <div>
              <h3 className={`font-bold mb-4 ${headingClass}`}>
                {specificTitle}
              </h3>
              <ul className={`space-y-2 ${bodyClass}`}>
                {links.specific.map((link) => (
                  <li key={link.label}>
                    {link.href === "#" ? (
                      <span className={disabledClass}>
                        {link.label}
                      </span>
                    ) : (
                      <Link href={link.href} className={hoverColor}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className={`font-bold mb-4 ${headingClass}`}>
              Company
            </h3>
            <ul className={`space-y-2 ${bodyClass}`}>
              {links.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={hoverColor}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`font-bold mb-4 ${headingClass}`}>
              Support
            </h3>
            <ul className={`space-y-2 ${bodyClass}`}>
              {links.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={hoverColor}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`border-t mt-8 pt-8 text-center ${borderClass} ${copyrightClass}`}>
          <p>&copy; 2025 InternsNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
