"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { Project } from "@/lib/projects";
import { projects } from "@/lib/projects";
import Link from "next/link";
import { ProjectImage } from "@/components/project-image";

const FEATURED_PROJECTS: Project[] = projects.slice(0, 3);

export function FeaturedProjectsSection() {
  const { ref, isInView } = useInView();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#040E1F] border-y border-white/[0.06]"
    >
      {/* Deep navy base + subtle blue gradients — preserved from original WHY COREX IT */}
      <div className="absolute inset-0 bg-[#040E1F]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#071A33] via-[#0A2450] to-[#040E1F]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_600px_at_75%_18%,rgba(0,87,184,0.13),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_12%_82%,rgba(59,130,246,0.08),transparent_65%)]" />

      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* blurred ambient glows */}
      <div className="absolute -top-32 -right-32 w-[720px] h-[720px] rounded-full bg-[#0057B8]/10 blur-[80px] pointer-events-none" />
      <div className="absolute top-[38%] -left-32 w-[560px] h-[560px] rounded-full bg-[#0F5BDB]/[0.06] blur-[70px] pointer-events-none" />

      {/* transition smoothing */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/[0.04] via-white/[0.015] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/[0.025] to-transparent pointer-events-none" />

      {/* geometric accents */}
      <div className="absolute top-20 right-[18%] w-32 h-32 rounded-[20px] bg-white/[0.02] border border-white/[0.04] backdrop-blur pointer-events-none hidden lg:block" style={{ transform: "rotate(12deg)" }} />
      <div className="absolute bottom-24 right-[28%] w-20 h-20 rounded-2xl bg-[#0057B8]/10 border border-[#3B82F6]/15 pointer-events-none hidden lg:block" style={{ transform: "rotate(-8deg)" }} />

      {/* floating light particles */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute top-24 right-[32%] w-1.5 h-1.5 rounded-full bg-[#8AB6FF]/40 blur-[0.5px] pointer-events-none"
            animate={{ y: [0, -10, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-32 left-[28%] w-1 h-1 rounded-full bg-white/30 pointer-events-none"
            animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 right-[12%] w-2 h-2 rounded-full bg-[#3B82F6]/20 pointer-events-none hidden lg:block"
            animate={{ y: [0, -14, 0], x: [0, 4, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </>
      )}

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-16 md:py-20 lg:py-24">
        {/* Header */}
        <div className="text-center lg:text-left mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur border border-white/10 text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8AB6FF] mb-4">
            <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            FEATURED PROJECTS
          </span>
          <motion.h2
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white"
          >
            Digital products built for real-world impact.
          </motion.h2>
          <motion.p
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="text-[15px] leading-[1.7] text-white/60 max-w-2xl mx-auto mt-4"
          >
            Corex IT delivers complete software solutions — from concept and architecture to deployment and ongoing support. Every product is built with modern technology stacks, rigorous quality engineering, and a focus on scalability and long-term maintainability.
          </motion.p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-[#0057B8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#003B7A] transition-colors"
            >
              View All Projects
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Project cards — asymmetric/editorial layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_PROJECTS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.12 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[20px] bg-white/[0.04] backdrop-blur-xl border border-white/07 p-6 hover:bg-white/[0.06] hover:border-[#0057B8]/20 hover:shadow-[0_14px_40px_rgba(0,87,184,0.1)] transition-all duration-300 group overflow-hidden"
            >
              {/* Project image */}
              <ProjectImage
                slug={p.slug}
                alt={p.title}
                className="rounded-[16px] h-[280px] md:h-[340px] lg:h-[380px] object-cover overflow-hidden mb-4 transition-transform group-hover:scale-[1.02] group-hover:brightness-[1.05]"
              />

              {/* Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

              {/* Tech tags badge */}
              <div className="absolute top-4 right-4 flex gap-2">
                {p.technologies.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full bg-[#0057B8]/20 border border-[#0057B8]/30 text-[10px] font-medium text-[#8AB6FF] hover:bg-[#0057B8] hover:text-white transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Card content */}
              <div className="relative pt-6">
                <span className="absolute top-3 left-3 text-[10px] font-medium tracking-[0.1em] uppercase text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {p.category}
                </span>

                <h3 className="relative text-[17px] md-text-[19px] font-semibold tracking-[-0.01em] text-white mt-2 group-hover:text-white transition-colors">
                  {p.title}
                </h3>

                <p className="relative text-[13px] leading-[1.6] text-white/55 mt-3 line-clamp-3">
                  {p.description}
                </p>

                {/* View Project button */}
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#071A33] hover:bg-[#F0F4FF] hover:text-[#0057B8] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    View Project
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}