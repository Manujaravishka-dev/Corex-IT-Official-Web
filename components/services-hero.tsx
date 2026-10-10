"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useWebsiteImages, toSlideImages } from "@/hooks/use-website-images";

export function ServicesHero() {
  const { images: dbImages } = useWebsiteImages("services");
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
      aria-label="Services hero"
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

        <div className="absolute inset-0 bg-gradient-to-r from-[#071A33]/88 via-[#071A33]/62 to-[#071A33]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/60 via-transparent to-[#071A33]/18" />
        <div className="absolute -top-24 -right-20 w-[640px] h-[640px] rounded-full bg-[#0057B8]/16 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-[38%] -translate-y-1/2 w-[760px] h-[480px] rounded-full bg-[#0057B8]/10 blur-[60px] pointer-events-none hidden lg:block" />
        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center min-h-[52vh] md:min-h-[56vh] lg:min-h-[60vh] py-10 md:py-14 lg:py-12">
        <div className="w-full max-w-[680px] xl:max-w-[700px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 mb-5"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[10px] tracking-[0.12em] uppercase text-white/90 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8AB6FF] animate-pulse" />
              Our Services
            </span>
            <span className="hidden sm:inline text-[10px] tracking-[0.12em] uppercase text-white/50">Web · Mobile · Cloud · UI/UX</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[0.92] tracking-[-0.04em] text-white"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.28)" }}
          >
            Our Services
            <br />
            <span className="font-light tracking-[-0.04em] text-white/95">Smart technology</span>
            <br />
            <span className="bg-gradient-to-r from-[#8AB6FF] via-[#5B9EFF] to-[#0057B8] bg-clip-text text-transparent">
              solutions designed to
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#8AB6FF] via-[#5B9EFF] to-[#0057B8] bg-clip-text text-transparent">
              move your business forward.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="text-[14.5px] md:text-[15.5px] leading-[1.7] text-white/80 max-w-[560px] mt-5"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.28)" }}
          >
            We provide modern digital and software solutions — from web and mobile development to UI/UX design and
            cloud engineering — crafted to help ambitious businesses scale with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="flex flex-wrap gap-3 mt-7"
          >
            <Link
              href="#services-content"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-none bg-[#0057B8] text-white text-[14px] font-semibold hover:bg-[#003B7A] transition-colors shadow-[0_10px_28px_rgba(0,87,184,0.38)]"
            >
              Explore Our Services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-none bg-white/10 backdrop-blur border border-white/20 text-white text-[14px] font-semibold hover:bg-white hover:text-[#071A33] hover:border-white transition-colors"
            >
              Talk to Us
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute z-20 bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
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

      <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
        <div className="h-px bg-white/10" />
      </div>
    </section>
  );
}
