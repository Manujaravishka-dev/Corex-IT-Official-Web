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
  { label: "Career", href: "/career" },
];

const rightLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

const mobileLinks = [...leftLinks, ...rightLinks];


export function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/corexit-admin");
  const overlayHero = pathname === "/" || pathname === "/career";
  const navigationLinks = mobileLinks;
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
            ? "h-[76px] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]"
            : overlayHero ? "h-[90px] bg-transparent" : "h-[90px] bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-[1280px] mx-auto h-full flex items-center gap-3 px-4 md:px-6 lg:px-4 xl:px-5 relative">
          
          {/* Left Side: Brand Name */}
          <Link href="/" className="flex items-center shrink-0 group">
            <span className={`text-[18px] lg:text-[19px] font-extrabold tracking-tight transition-transform duration-300 group-hover:scale-105 ${overlayHero && !isScrolled ? "text-white" : "text-[#071A33]"}`}>
              COREX <span className="text-[#0057B8]">IT</span>
            </span>
          </Link>

          {/* Center navigation — compact Koyeb-inspired grouping, COREX branding */}
          <div className={`hidden lg:flex flex-1 min-w-0 items-center justify-center gap-0.5 h-[54px] px-3 xl:px-4 rounded-[10px] ${overlayHero && !isScrolled ? "bg-white/15 backdrop-blur-md border border-white/20" : "bg-[#EDF2F8]"}`}>
            {navigationLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-center h-[38px] px-2 xl:px-3 rounded-[7px] text-[13px] xl:text-[14px] font-medium whitespace-nowrap transition-colors duration-200 ${active ? "text-[#0056B8] bg-[#DCEAFB]" : overlayHero && !isScrolled ? "text-white hover:bg-white/20" : "text-[#263B56] hover:text-[#0056B8] hover:bg-white/70"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side: CTA Button + Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0 ml-auto lg:ml-0">
            <Link
              href="/contact"
              className="hidden md:inline-flex h-[54px] items-center gap-2 px-4 xl:px-6 rounded-[8px] bg-[#0056B8] text-white text-[14px] font-semibold hover:bg-[#00458F] transition-colors duration-200 shadow-[0_4px_0_#003B7A] whitespace-nowrap"
            >
              Let&apos;s Talk
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-11 h-11 rounded-[8px] border border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all shadow-sm shrink-0 active:scale-95"
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
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col pt-[90px]"
          >
            <nav className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {mobileLinks
                  
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
      <div className={overlayHero ? "h-0" : "h-[90px]"} aria-hidden />
    </>
  );
}