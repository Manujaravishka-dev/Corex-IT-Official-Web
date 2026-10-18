"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProjectsHero } from "@/components/projects-hero";

type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  type?: string;
  industry?: string;
  year?: string;
  description: string;
  image?: string;
  logo?: string;
  technologies?: string[];
};

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState("All Projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/projects")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load projects");
        if (mounted) setProjects(data.projects || []);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(
    () => ["All Projects", ...Array.from(new Set(projects.map((project) => project.category).filter(Boolean)))],
    [projects]
  );
  const filtered = active === "All Projects" ? projects : projects.filter((project) => project.category === active);

  return (
    <div className="bg-white">
      <ProjectsHero />
      <div id="projects-content" className="sticky top-[76px] z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] gap-2 overflow-x-auto px-5 py-4 md:px-8">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={`shrink-0 rounded-md border px-4 py-2 text-sm transition-colors ${active === category ? "border-[#0057B8] bg-[#0057B8] text-white" : "border-slate-200 text-slate-600 hover:border-[#0057B8]"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <section className="mx-auto max-w-[1200px] px-5 py-12 md:px-8 md:py-20">
        {loading ? (
          <p className="py-16 text-center text-slate-500">Loading projects...</p>
        ) : error ? (
          <p role="alert" className="py-16 text-center text-red-600">Projects are temporarily unavailable. Please try again later.</p>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-slate-200 p-10 text-center">
            <h2 className="text-xl font-semibold">No public projects yet</h2>
            <p className="mt-3 text-slate-500">Check back soon or contact us to discuss your project.</p>
            <Link href="/contact" className="mt-5 inline-block bg-[#0057B8] px-6 py-3 text-white">Contact Us</Link>
          </div>
        ) : (
          <div className="border-t border-slate-200">
            {filtered.map((project, index) => (
              <article
                key={project.id}
                className="grid overflow-hidden border-b border-slate-200 lg:min-h-[430px] lg:grid-cols-2"
              >
                <div className={`flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-12 lg:py-14 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  {project.logo ? (
                    <img src={project.logo} alt={`${project.title} logo`} className="mb-6 max-h-12 max-w-40 object-contain object-left" />
                  ) : (
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-[#0057B8]">{project.category || "COREX IT PROJECT"}</p>
                  )}
                  <h2 className="max-w-[470px] text-3xl font-bold leading-tight tracking-tight text-[#071A33] sm:text-4xl">{project.title}</h2>
                  <p className="mt-5 max-w-[470px] text-[15px] leading-7 text-slate-600 line-clamp-6">{project.description}</p>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="mt-7 inline-flex w-fit items-center gap-3 bg-[#0057B8] px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#003F8C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057B8]"
                  >
                    Read Full Case Study <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <Link
                  href={`/projects/${project.slug}`}
                  aria-label={`View ${project.title} case study`}
                  className={`group relative block min-h-[280px] overflow-hidden bg-[#EDF2F8] sm:min-h-[360px] lg:min-h-full ${index % 2 === 1 ? "lg:order-1" : ""}`}
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={`${project.title} project preview`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold tracking-widest text-slate-400">COREX IT</div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
