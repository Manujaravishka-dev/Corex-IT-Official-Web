"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { useState, useMemo } from "react";
import { useWebsiteImages } from "@/hooks/use-website-images";

type Project = {
  id: string;
  title: string;
  category: string;
  desc: string;
  tech: string[];
  image: string;
  year: string;
};

const defaultProjects: Project[] = [
  {
    id: "nexus",
    title: "Nexus Analytics",
    category: "Web Application — Finance",
    desc: "Real-time analytics platform for enterprise data — interactive dashboards, drill-downs and sub-40ms queries for finance teams.",
    tech: ["React", "Next.js", "Node.js", "PostgreSQL"],
    image: "",
    year: "2024",
  },
  {
    id: "marketplace",
    title: "MarketPlace Pro",
    category: "E-Commerce Platform — Retail",
    desc: "Full-featured marketplace with vendor management, payments, inventory and real-time order tracking at scale.",
    tech: ["React", "Next.js", "MongoDB", "Stripe"],
    image: "",
    year: "2024",
  },
  {
    id: "taskflow",
    title: "TaskFlow",
    category: "Mobile Application — Productivity",
    desc: "Cross-platform productivity app with sync, drag-and-drop workflows and intelligent notifications.",
    tech: ["React Native", "Firebase", "TypeScript"],
    image: "",
    year: "2023",
  },
  {
    id: "health",
    title: "CarePortal",
    category: "Healthcare Platform — Enterprise",
    desc: "Patient management with scheduling, medical records, telehealth and HIPAA-compliant data handling.",
    tech: [".NET", "Next.js", "SQL Server", "Azure"],
    image: "",
    year: "2023",
  },
];

export function ProjectsSection() {
  const { ref } = useInView();
  const { images: projectImages } = useWebsiteImages("projects");

  const projects = useMemo(() => {
    if (projectImages.length === 0) return defaultProjects;
    const imgMap = new Map<string, string>();
    projectImages.forEach((img) => {
      if (img.title && img.imageUrl) imgMap.set(img.title.toLowerCase(), img.imageUrl);
    });
    return defaultProjects.map((p) => ({
      ...p,
      image: imgMap.get(p.title.toLowerCase()) || "",
    }));
  }, [projectImages]);

  return (
    <section id="projects" className="relative bg-[#F8F8F8] overflow-hidden border-y border-slate-100">
      <div ref={ref} className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>

            <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#071A33]">
              Selected work.
            </h2>
          </div>
          <p className="max-w-[480px] text-[14.5px] leading-[1.6] text-slate-600 md:text-right">
            Enterprise projects that showcase our ability to deliver across industries and stacks.
          </p>
        </div>

        <div className="space-y-6">
          {/* TEMPORARILY COMMENTED OUT — project cards hidden.
              Re-enable by uncommenting the block below. Project data in
              `defaultProjects` above is preserved and NOT deleted. */}
          {/*
          {projects.map((p, i) => (
            <ProjectRow key={p.id} project={p} index={i} reverse={i % 2 === 1} />
          ))}
          */}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ project, index, reverse }: { project: Project; index: number; reverse: boolean }) {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`group grid lg:grid-cols-12 gap-0 overflow-hidden rounded-[18px] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-400`}
    >
      <div className={`relative h-[260px] md:h-[320px] lg:h-auto overflow-hidden bg-slate-100 ${reverse ? "lg:order-2" : ""} lg:col-span-7`}>
        {project.image && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]" loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full bg-[#EAF4FF] flex items-center justify-center">
            <span className="text-[13px] font-extrabold tracking-[-0.02em] text-[#7B93B5]">
              COREX <span className="text-[#0057B8]">IT</span>
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/30 via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-white/20 text-[11px] font-semibold tracking-[0.06em] uppercase text-[#071A33]">
          {project.year} · {project.category}
        </span>
      </div>

      <div className={`p-7 md:p-8 flex flex-col ${reverse ? "lg:order-1" : ""} lg:col-span-5`}>
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#0057B8] font-semibold">Project {String(index + 1).padStart(2, "0")}</span>
        <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33] mt-2">{project.title}</h3>
        <p className="text-[13.5px] leading-[1.6] text-slate-600 mt-3 flex-1">{project.desc}</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {project.tech.map((t) => (
            <span key={t} className="px-3 py-1 rounded-full bg-[#F8F8F8] border border-[#E5E7EB] text-[11px] font-medium tracking-[0.04em] text-slate-600">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between pt-5 border-t border-slate-100">
          <a href="#contact" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#071A33] group-hover:text-[#0057B8] transition-colors">
            View Project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <span className="text-[11px] tracking-[0.06em] uppercase text-slate-400">Corex IT</span>
        </div>
      </div>
    </motion.div>
  );
}
