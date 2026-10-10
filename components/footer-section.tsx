"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { reportPublicFirestoreError } from "@/lib/firestore-errors";
import { COLLECTIONS, SETTINGS_DOC_ID, type CompanySettings } from "@/lib/firestore-types";
import { defaultCompanySettings } from "@/lib/site-settings";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14 13.5h2.5l.5-3H14V7.8c0-.9.25-1.5 1.54-1.5H17V3.2A22.1 22.1 0 0014.25 3c-2.42 0-4.08 1.48-4.08 4.2v2.3H7.5v3h2.67V21h3.33v-7.5z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.04a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0012 2.04z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03a6.87 6.87 0 01-2.43-3.3c-.29-.94-.46-1.94-.42-2.94.06-1.43.47-2.86 1.24-4.04.81-1.24 1.97-2.18 3.32-2.69.92-.35 1.9-.52 2.89-.52.32 0 .64.02.95.05v4.08c-.27-.04-.55-.08-.83-.1-.53-.03-1.06.08-1.53.32-.68.35-1.2.97-1.43 1.7-.2.62-.18 1.31.05 1.92.23.61.7 1.12 1.28 1.4.59.29 1.29.35 1.93.18.6-.16 1.13-.5 1.5-1 .37-.49.58-1.1.59-1.72.02-2.84 0-5.68.02-8.52 0-.58.02-1.16 0-1.74z" />
    </svg>
  );
}

const links = {
  quick: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Technologies", href: "/technologies" },
    { label: "Projects", href: "/projects" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "Web Development", href: "/#services" },
    { label: "Mobile Apps", href: "/#services" },
    { label: "Custom Software", href: "/#services" },
    { label: "UI/UX Design", href: "/#services" },
    { label: "Cloud & DevOps", href: "/#services" },
  ],
  tech: [
    { label: "React / Next.js", href: "/#technologies" },
    { label: ".NET / Java", href: "/#technologies" },
    { label: "Node.js / Python", href: "/#technologies" },
    { label: "PostgreSQL / MongoDB", href: "/#technologies" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  useEffect(() => {
    let cancelled = false;
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID));
        if (!cancelled && snap.exists()) {
          setSettings({ ...defaultCompanySettings, ...(snap.data() as CompanySettings) });
        }
      } catch (err) {
        reportPublicFirestoreError(`${COLLECTIONS.settings}/${SETTINGS_DOC_ID}`, "get", err);
        // keep defaults for public visitors
      }
    }
    fetchSettings();
    return () => { cancelled = true; };
  }, []);
  if (pathname?.startsWith("/corexit-admin")) return null;

  const dynamicSocialLinks = [
    { name: "Facebook", url: settings.facebook, icon: FacebookIcon },
    { name: "GitHub", url: settings.github, icon: GithubIcon },
    { name: "TikTok", url: settings.tiktok, icon: TikTokIcon },
    { name: "LinkedIn", url: settings.linkedin, icon: LinkedinIcon },
  ];

  return (
    <footer className="bg-[#071A33] border-t border-white/[0.06]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 md:py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center group">
              <span className="text-[22px] md:text-[24px] font-extrabold tracking-tight text-white transition-transform duration-300 group-hover:scale-[1.02]">
                COREX <span className="text-[#8AB6FF]">IT</span>
              </span>
            </Link>
            <p className="text-[13px] leading-[1.7] text-white/60 mt-4 max-w-sm">
              Professional Software & Digital Solutions. Building scalable products for businesses ready to grow — from Colombo to the world.
            </p>
            <div className="mt-6 flex gap-3">
              {dynamicSocialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-9 h-9 rounded-none bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:bg-[#0057B8] hover:border-[#0057B8] hover:text-white transition-colors"
                  >
                    <Icon className="w-[16px] h-[16px]" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/40 mb-4">Quick Links</p>
            <nav className="space-y-2.5">
              {links.quick.map((l) => (
                <Link key={l.label} href={l.href} className="block text-[13px] text-white/60 hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/40 mb-4">Services</p>
            <nav className="space-y-2.5">
{links.services.slice(0, 4).map((l) => (
                <Link key={l.label} href={l.href} className="block text-[13px] text-white/60 hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <Link href="/#services" className="text-white/60 hover:text-white transition-colors">
                  Cloud & DevOps
                </Link>
              </div>
              <div className="mt-2">
                <Link href="/terms-and-conditions" className="text-white hover:text-[#A0A0A0] transition-colors block">
                  Terms & Conditions
                </Link>
              </div>
            </nav>
          </div>

          <div className="md:col-span-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/40 mb-4">Contact</p>
            <div className="space-y-3 text-[13px] leading-[1.6] text-white/60">
              <p>{settings.email}</p>
              <p>{settings.address}</p>
              {settings.phone && <p>{settings.phone}</p>}
              <Link href="/contact" className="inline-flex items-center gap-1.5 text-white font-semibold hover:text-[#8AB6FF] transition-colors">
                Get in touch
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/35">© {new Date().getFullYear()} Corex IT. All rights reserved.</p>
          <p className="text-[11px] tracking-[0.08em] uppercase text-white/25 font-medium">Engineered with precision · Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
}
