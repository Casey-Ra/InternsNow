import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InternsNow - Connect Students with Dream Opportunities",
  description: "InternsNow bridges the gap between talented students seeking their first career opportunities and employers looking for fresh, motivated talent.",
  keywords: ["internships", "jobs", "students", "employers", "career", "opportunities"],
  authors: [{ name: "InternsNow Team" }],
  openGraph: {
    title: "InternsNow - Connect Students with Dream Opportunities",
    description: "The premier platform for connecting students with internships and employers with talent.",
    url: "https://internsnow.vercel.app",
    siteName: "InternsNow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InternsNow - Connect Students with Dream Opportunities",
    description: "The premier platform for connecting students with internships and employers with talent.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
