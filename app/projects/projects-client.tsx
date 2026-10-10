"use client";

import { useState } from "react";
import Link from "next/link";
import { projects, projectCategories } from "@/lib/projects";
import { ProjectsHero } from "@/components/projects-hero";
import { ProjectImage } from "@/components/project-image";

export default function ProjectsClient() {
  const [active, setActive] = useState<(typeof projectCategories)[number]>("All Projects");

  const filtered =
    active === "All Projects"
      ? projects
      : projects.filter((p) => p.category === active || p.type === active);

  return (
    <div className="bg-white">
      <ProjectsHero />

      {/* secondary navigation / filter */}
      <div id="projects-content" className="sticky top-[68px] md:top-[84px] z-20 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {projectCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`shrink-0 px-4 py-2 rounded-none text-[13px] font-medium border transition-colors ${
                  active === cat
                    ? "bg-[#0057B8] border-[#0057B8] text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#071A33]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 md:py-14">
        {filtered.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-slate-200 bg-[#F8F8F8] p-10 md:p-16 text-center">
            <h3 className="text-[18px] font-semibold text-[#071A33]">No public projects yet</h3>
            <p className="text-[14px] leading-[1.7] text-slate-500 max-w-[520px] mx-auto mt-3">
              Corex IT primarily builds private enterprise software. Public case studies will appear here when available.
              In the meantime, explore our services and technologies or get in touch to discuss a private demo.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/services" className="px-6 py-2.5 rounded-none bg-[#0057B8] text-white text-[13px] font-semibold hover:bg-[#003B7A] transition-colors">
                Explore Services
              </Link>
              <Link href="/contact" className="px-6 py-2.5 rounded-none border border-slate-200 bg-white text-[#071A33] text-[13px] font-semibold hover:border-slate-300 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TEMPORARILY COMMENTED OUT — project cards hidden.
                Re-enable by uncommenting the block below. Project data in
                `@/lib/projects` is preserved and NOT deleted. */}
            {/*
            {filtered.map((p, i) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group grid lg:grid-cols-12 gap-0 overflow-hidden rounded-[18px] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-[0_12px_40px_rgba(7,26,51,0.08)] transition-all duration-300"
              >
                <div className={`relative h-[260px] md:h-[360px] lg:h-[380px] overflow-hidden bg-slate-100 ${i % 2 === 1 ? "lg:order-2" : ""} lg:col-span-7`}>
                  <ProjectImage slug={p.slug} alt={p.title} className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/30 via-transparent to-transparent opacity-60 group-hover:opacity-50 transition-opacity" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-white/20 text-[11px] font-semibold tracking-[0.06em] uppercase text-[#071A33]">
                    {p.year} · {p.category}
                  </span>
                </div>
                <div className={`p-7 md:p-8 flex flex-col ${i % 2 === 1 ? "lg:order-1" : ""} lg:col-span-5`}>
                  <span className="text-[11px] tracking-[0.12em] uppercase text-[#0057B8] font-semibold">{p.type} · {p.industry}</span>
                  <h3 className="text-[22px] md:text-[24px] font-bold tracking-[-0.02em] text-[#071A33] mt-2">{p.title}</h3>
                  <p className="text-[13.5px] leading-[1.7] text-slate-600 mt-3 line-clamp-3">{p.description}</p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {p.technologies.slice(0, 4).map((t) => (
                      <span key={t} className="px-3 py-1 rounded-full bg-[#F8F8F8] border border-[#E5E7EB] text-[11px] font-medium text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-[#071A33] group-hover:text-[#0057B8] transition-colors">
                    View Project
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform group-hover:translate-x-0.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
            */}
          </div>
        )}
      </section>
    </div>
  );
}
