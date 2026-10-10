import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer-section";
import { CookieConsent } from "@/components/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Production URL configuration.
 * Prefer NEXT_PUBLIC_SITE_URL environment variable.
 * Set this in Vercel: NEXT_PUBLIC_SITE_URL=https://corex-it.vercel.app
 * Falls back to the deployed domain root for relative URLs.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://corex-it.com";

export const metadata: Metadata = {
  title: {
    default: "Corex IT | Software & Digital Solutions",
    template: "%s | Corex IT",
  },
  description:
    "Corex IT is a Sri Lankan software company delivering modern websites, web applications, mobile applications, POS systems, custom software, UI/UX design and reliable digital solutions for businesses.",
  keywords: [
    "Corex IT",
    "CorexIT",
    "software company Sri Lanka",
    "IT company Sri Lanka",
    "web development Sri Lanka",
    "website development",
    "mobile app development",
    "custom software development",
    "POS system development",
    "business software solutions",
    "UI UX design",
    "Next.js development",
    "React development",
    "digital solutions Sri Lanka",
    "software engineering company",
    "Colombo software company",
  ],
  authors: [
    {
      name: "Corex IT",
    },
  ],
  openGraph: {
    type: "website" as const,
    siteName: "Corex IT",
    title: "Corex IT | Software & Digital Solutions",
    description:
      "Corex IT is a Sri Lankan software company delivering modern websites, web applications, mobile applications, POS systems, custom software, UI/UX design and reliable digital solutions for businesses.",
    images: [
      {
        url: `${siteUrl}/og-preview.jpg`,
        width: 1200,
        height: 630,
        alt: "Corex IT - Sri Lankan software company delivering custom digital solutions",
      },
    ],
    locale: "en_LK",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Corex IT | Software & Digital Solutions",
    description:
      "Corex IT is a Sri Lankan software company delivering modern websites, web applications, mobile applications, POS systems, custom software, UI/UX design and reliable digital solutions for businesses.",
    images: [
      `${siteUrl}/og-preview.jpg`,
    ],
    creator: "@corex_it",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "standard",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

/**
 * JSON-LD Structured Data for Corex IT
 * Organization type with verified information from company settings.
 * Rendered as a script tag in the layout - Next.js automatically moves
 * relevant script tags to the <head> during compilation.
 */
const jsonLd = `
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Corex IT",
    "description": "Sri Lankan software company delivering modern websites, web applications, mobile applications, POS systems, custom software, UI/UX design and reliable digital solutions for businesses.",
    "url": "${siteUrl}",
    "logo": "${siteUrl}/favicon.ico",
    "email": "hello@corexit.com",
    "telephone": "+94 11 234 5678",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Sri Lanka",
      "addressLocality": "Colombo"
    },
    "sameAs": [
      "https://facebook.com/your-page",
      "https://github.com/your-profile",
      "https://tiktok.com/@your-profile",
      "https://linkedin.com/company/your-company"
    ]
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-800">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />

        {/* JSON-LD Structured Data - Next.js moves script tags to <head> */}
        <script
          async
          dangerouslySetInnerHTML={{
            __html: jsonLd,
          }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}