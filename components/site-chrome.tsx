"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer-section";
import { CookieConsent } from "@/components/cookie-consent";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCustomerFeedback = pathname === "/testimonial" || pathname.startsWith("/testimonial/");
  if (isCustomerFeedback) {
    return (
      <>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-[72px] max-w-[640px] items-center justify-center px-6">
            <span className="select-none text-[20px] font-extrabold tracking-tight text-[#071A33]" aria-label="Corex IT">
              COREX <span className="text-[#0057B8]">IT</span>
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}
