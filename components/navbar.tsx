"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { reportPublicFirestoreError } from "@/lib/firestore-errors";
import { COLLECTIONS, SETTINGS_DOC_ID } from "@/lib/firestore-types";
import { defaultCompanySettings } from "@/lib/site-settings";

const leftLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Career", href: "/technologies" },
];

const rightLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

const mobileLinks = [...leftLinks, ...rightLinks];
const hiddenNavLinks = new Set(["Projects"]);

export function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/corexit-admin");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [companyEmail, setCompanyEmail] = useState(defaultCompanySettings.email);
  const [companyAddress, setCompanyAddress] = useState(defaultCompanySettings.address);

  useEffect(() => {
    if (isAdminRoute) return;
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID));
        if (!cancelled && snap.exists()) {
          const data = snap.data() as Partial<typeof defaultCompanySettings>;
          if (data.email) setCompanyEmail(data.email);
          if (data.address) setCompanyAddress(data.address);
        }
      } catch (err) {
        reportPublicFirestoreError(`${COLLECTIONS.settings}/${SETTINGS_DOC_ID}`, "get", err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isAdminRoute]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Private admin routes must NOT show public Navbar (spec: no Login/Admin button anywhere public, private URLs only)
  if (isAdminRoute) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "h-[72px] bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]"
            : "h-[88px] bg-transparent border-b border-slate-100/60"
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 lg:px-12 relative">
          
          {/* Left Side: Brand Name */}
          <Link href="/" className="flex items-center shrink-0 group">
            <span className="text-[20px] lg:text-[22px] font-extrabold tracking-tight text-[#071A33] transition-transform duration-300 group-hover:scale-105">
              COREX <span className="text-[#0057B8]">IT</span>
            </span>
          </Link>

          {/* Desktop Center/Grouped Section: Left Links + Right Links combined near the middle */}
          <div className="hidden lg:flex items-center gap-1 mx-auto">
            {[...leftLinks, ...rightLinks]
              .filter((l) => !hiddenNavLinks.has(l.label))
              .map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="relative px-3.5 xl:px-4 py-2 text-[13.5px] font-medium tracking-[-0.01em] text-slate-600 hover:text-[#0057B8] transition-colors duration-200 group whitespace-nowrap"
                >
                  {l.label}
                  <span className="absolute left-3.5 xl:left-4 right-3.5 xl:right-4 bottom-1 h-px bg-[#0057B8] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </Link>
              ))}
          </div>

          {/* Right Side: CTA Button + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-none bg-gradient-to-r from-[#0057B8] to-[#00418c] text-white text-[13.5px] font-semibold tracking-wide hover:from-[#00418c] hover:to-[#002f66] transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,87,184,0.39)] hover:shadow-[0_6px_20px_rgba(0,87,184,0.45)] hover:-translate-y-0.5 whitespace-nowrap"
            >
              Let&apos;s Talk
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-11 h-11 rounded-none border border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all shadow-sm shrink-0 active:scale-95"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col pt-[88px]"
          >
            <nav className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {mobileLinks
                  .filter((l) => !hiddenNavLinks.has(l.label))
                  .map((l, i) => (
                    <motion.div
                      key={l.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-between py-4 px-4 rounded-none hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                      >
                        <span className="flex items-center gap-4">
                          <span className="text-[12px] font-bold tracking-widest text-[#0057B8]">0{i + 1}</span>
                          <span className="text-[18px] font-semibold tracking-tight text-[#071A33] group-hover:text-[#0057B8] transition-colors">{l.label}</span>
                        </span>
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0057B8] group-hover:text-white transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-auto pt-8 border-t border-slate-100"
              >
                <Link
                  href="/contact"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-none bg-[#0057B8] text-white text-[15px] font-semibold shadow-lg shadow-blue-500/25 hover:bg-[#00418c] transition-all"
                >
                  Let&apos;s Talk — Start a Project
                  <ArrowRight size={16} />
                </Link>
                <p className="text-center text-[13px] text-slate-400 mt-5 font-medium">{companyEmail} · {companyAddress}</p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content hiding under fixed nav */}
      <div className="h-[88px]" aria-hidden />
    </>
  );
}