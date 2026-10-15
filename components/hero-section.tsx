"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { MergedInstanceAnimation } from "@/components/3d/MergedInstanceAnimation";

const HERO_IMAGES = [
  {
    src: "/images/corex-hero.jpg",
    alt: "Enterprise technology network — Corex IT",
    pos: "object-[center_35%]",
  },
  {
    src: "/images/corex-hero-2.jpg",
    alt: "Modern software engineering workspace — Corex IT",
    pos: "object-[center_40%]",
  },
  {
    src: "/images/corex-hero-3.jpg",
    alt: "Digital transformation enterprise environment — Corex IT",
    pos: "object-[center_45%]",
  },
];
=======
import { useEffect, useState, useMemo } from "react";
import { useWebsiteImages, toSlideImages } from "@/hooks/use-website-images";
>>>>>>> 2c025544e1f15a8d71a440e0c31624deb1a31c5f

export function HeroSection() {
  const { images: dbImages, loading } = useWebsiteImages("hero");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => toSlideImages(dbImages), [dbImages]);
  const hasSlides = slides.length > 0;
  const safeIndex = Math.min(index, Math.max(slides.length - 1, 0));

  useEffect(() => {
    if (paused || !hasSlides) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [paused, slides.length, hasSlides]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#071A33]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        {hasSlides ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={safeIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={slides[safeIndex].src}
                alt={slides[safeIndex].alt}
                fill
                priority={safeIndex === 0}
                sizes="100vw"
                className={`object-cover ${slides[safeIndex].pos}`}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#071A33] via-[#0A2450] to-[#040E1F]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#071A33]/85 via-[#071A33]/68 to-[#071A33]/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/55 via-transparent to-[#071A33]/25" />
        <div className="absolute -top-28 -right-24 w-[760px] h-[760px] rounded-full bg-[#0057B8]/18 blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 left-[42%] -translate-y-1/2 w-[900px] h-[520px] rounded-full bg-[#0057B8]/10 blur-[70px] pointer-events-none hidden lg:block" />
        <div className="absolute inset-0 opacity-[0.045] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />
      </div>

<<<<<<< HEAD
      {/* 3D Animation Layer — behind content, above images */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <MergedInstanceAnimation />
      </div>

      {/* content — ~100vh, image covers 100% width/height, text above */}
=======
>>>>>>> 2c025544e1f15a8d71a440e0c31624deb1a31c5f
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

      <div className="absolute z-20 bottom-[18px] md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-10 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`transition-all duration-300 rounded-none ${
              i === safeIndex ? "w-8 h-1.5 bg-white" : "w-6 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-none">
        <div className="h-px bg-white/10" />
        <div className="hidden md:flex items-center justify-between max-w-[1440px] mx-auto px-6 lg:px-10 py-2.5">
          <span className="text-[10px] tracking-[0.14em] uppercase text-white/45">© 2026 Corex IT — Engineering excellence</span>
          <span className="text-[10px] tracking-[0.14em] uppercase text-white/45 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            All systems operational
          </span>
        </div>
      </div>
    </section>
  );
}
