"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { useState } from "react";
import { useWebsiteImages } from "@/hooks/use-website-images";

export function AboutSection() {
  const { ref, isInView } = useInView();
  const { images: aboutImages } = useWebsiteImages("about");
  const [imgError, setImgError] = useState(false);

  const sectionImage = aboutImages.length > 0 ? aboutImages[0] : null;
  const imgAlt = sectionImage ? (sectionImage.altText || sectionImage.title) : "Corex IT technology team collaboration";

  return (
    <section id="about" className="relative bg-white overflow-hidden">
      <div ref={ref} className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-6">

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(1.9rem,3.6vw,2.85rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[#071A33]"
            >
              Technology
              <br />
              <span className="font-light">that moves</span>
              <br />
              businesses forward.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="mt-8 flex gap-4"
            >
              <span className="hidden sm:block w-px self-stretch bg-[#E5E7EB] shrink-0" />
              <div>
                <p className="text-[15px] leading-[1.7] text-slate-600 max-w-[520px]">
                  Corex IT is a Sri Lankan software engineering company helping
                  enterprises and growing businesses transform ideas into reliable,
                  scalable digital products.
                </p>
                <p className="text-[15px] leading-[1.7] text-slate-500 mt-4 max-w-[520px]">
                  From strategy and design to development, deployment and long-term
                  support, we deliver with engineering discipline, modern architecture
                  and a commitment to measurable business outcomes.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 max-w-[480px]">
                  <div>
                    <p className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33] leading-none">50+</p>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 mt-1.5">Projects shipped</p>
                  </div>
                  <div className="border-l border-slate-100 pl-6">
                    <p className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33] leading-none">12+</p>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 mt-1.5">Years engineering</p>
                  </div>
                  <div className="border-l border-slate-100 pl-6">
                    <p className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33] leading-none">99%</p>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 mt-1.5">Client retention</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-[20px] overflow-hidden bg-[#071A33] p-1 shadow-[0_20px_60px_rgba(17,17,17,0.18)]">
              <div className="rounded-[16px] overflow-hidden bg-white">
                {sectionImage && !imgError ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={sectionImage.imageUrl}
                    alt={imgAlt}
                    className="w-full h-[360px] md:h-[440px] object-cover"
                    loading="lazy"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-[360px] md:h-[440px] bg-[#EAF4FF] flex flex-col items-center justify-center gap-2 px-6 text-center">
                    <span className="text-[22px] font-extrabold tracking-[-0.03em] text-[#071A33]">
                      COREX <span className="text-[#0057B8]">IT</span>
                    </span>
                    <p className="text-[11px] tracking-[0.14em] uppercase text-[#7B93B5]">About image will appear here</p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -left-4 md:bottom-6 md:-left-6 bg-white rounded-2xl border border-slate-200 shadow-[0_12px_32px_rgba(15,23,42,0.12)] px-5 py-4 hidden sm:flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#EAF4FF] border border-[#D4E8FF] flex items-center justify-center text-[#0057B8]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#071A33] leading-none">Enterprise-grade delivery</p>
                  <p className="text-[11px] text-slate-500 mt-1">Secure · Scalable · Compliant</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-[11px] tracking-[0.08em] uppercase text-slate-400 font-medium">
              Colombo · Singapore · Serving global clients
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
