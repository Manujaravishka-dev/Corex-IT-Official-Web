"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#071A33]"
    >
      {/* Image-free geometric gradient hero; no dots, grid or 3D artwork. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-r from-[#092C68] via-[#07569D] to-[#08A6E8]">
        <div className="absolute -left-[12%] top-[-50%] h-[125%] w-[76%] rotate-[32deg] bg-[#092452]/25" />
        <div className="absolute left-[25%] top-[-75%] h-[150%] w-[58%] rotate-[38deg] bg-[#2D9BD2]/20" />
        <div className="absolute -bottom-[75%] left-[20%] h-[120%] w-[80%] -rotate-[30deg] bg-[#003E86]/20" />
        <div className="absolute right-[-15%] top-[-30%] h-[95%] w-[35%] rotate-[35deg] border border-white/10" />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center min-h-[86vh] md:min-h-[88vh] lg:min-h-[calc(100vh-80px)] py-12 md:py-16 lg:py-10">
        <div className="w-full max-w-[640px] xl:max-w-[660px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <span className="w-8 h-px bg-[#0057B8]" />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8AB6FF]">
              Professional Software & Digital Solutions
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[10px] tracking-[0.1em] uppercase text-white/90 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0057B8] animate-pulse" />
              Enterprise Ready
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,5.4vw,4.6rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,0.22)" }}
          >
            Technology
            <br />
            <span className="font-light tracking-[-0.05em] text-white">that moves</span>
            <br />
            <span className="bg-gradient-to-r from-[#8AB6FF] via-[#0057B8] to-[#0057B8] bg-clip-text text-transparent">
              businesses forward.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="text-[15px] md:text-[16.5px] leading-[1.7] text-white/85 max-w-[560px] mt-6"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.28)" }}
          >
            Corex IT is a Sri Lankan enterprise technology partner. We design
            and engineer scalable web, mobile and cloud software that helps
            ambitious businesses innovate, operate smarter and grow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-none bg-[#0057B8] text-white text-[14px] font-semibold hover:bg-[#003B7A] transition-colors shadow-[0_10px_28px_rgba(0, 87, 184, 0.38)]"
            >
              Start a Project
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/#services"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-none bg-white/10 backdrop-blur border border-white/25 text-white text-[14px] font-semibold hover:bg-white hover:text-[#071A33] hover:border-white transition-colors"
            >
              Explore Our Services
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-10 flex flex-wrap items-center gap-6 pt-6 border-t border-white/15"
          >
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-white/70 font-medium">
              <span className="w-6 h-px bg-white/30" />
              Trusted by growing enterprises
            </span>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              Secure · Scalable · Cloud Native
            </span>
          </motion.div>
        </div>
      </div>


    </section>
  );
}
