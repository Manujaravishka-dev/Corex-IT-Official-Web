import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getRelatedProjects, projects } from "@/lib/projects";
import { ProjectImage } from "@/components/project-image";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} — Corex IT Projects`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const related = getRelatedProjects(slug);

  return (
    <div className="bg-white">
      {/* hero image */}
      <div className="relative w-full h-[380px] md:h-[480px] lg:h-[520px] overflow-hidden bg-slate-100">
        <ProjectImage slug={project.slug} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/60 via-[#071A33]/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 max-w-[1440px] mx-auto px-6 lg:px-10 pb-8 md:pb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-white/20 text-[11px] font-semibold tracking-[0.06em] uppercase text-[#071A33]">
            {project.category} · {project.industry} · {project.year}
          </span>
          <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white mt-4 max-w-[720px]">{project.title}</h1>
          <p className="text-[14.5px] leading-[1.6] text-white/80 max-w-[600px] mt-3">{project.description}</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 md:py-14">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#0057B8] mb-3">Project Overview</h2>
            <p className="text-[15px] leading-[1.8] text-slate-700">{project.overview}</p>

            <div className="mt-10">
              <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-4">Key Features</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {project.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[14px] leading-[1.6] text-slate-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0057B8] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-4">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <span key={t} className="px-3.5 py-1.5 rounded-full bg-[#EAF4FF] border border-[#D4E8FF] text-[13px] font-medium text-[#071A33]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {(project.challenge || project.solution) && (
              <div className="mt-10 grid md:grid-cols-2 gap-6">
                {project.challenge && (
                  <div className="rounded-[14px] bg-[#F8F8F8] border border-[#E5E7EB] p-6">
                    <h4 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#0057B8] mb-2">Challenge</h4>
                    <p className="text-[14px] leading-[1.7] text-slate-600">{project.challenge}</p>
                  </div>
                )}
                {project.solution && (
                  <div className="rounded-[14px] bg-[#071A33] text-white p-6">
                    <h4 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8AB6FF] mb-2">Solution</h4>
                    <p className="text-[14px] leading-[1.7] text-white/80">{project.solution}</p>
                  </div>
                )}
              </div>
            )}

            {project.images.length > 1 && (
              <div className="mt-10">
                <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-4">Additional Screenshots</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.images.map((img, i) => (
                    <ProjectImage key={i} slug={project.slug} alt={`${project.title} screenshot ${i + 1}`} className="w-full h-[260px] object-cover rounded-[14px] border border-slate-200" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 sticky top-[90px]">
              <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-4">Project Information</h3>
              <div className="space-y-4 text-[13px]">
                <div className="flex justify-between gap-4 py-2.5 border-b border-slate-50">
                  <span className="text-slate-400">Project Type</span>
                  <span className="font-medium text-[#071A33]">{project.type}</span>
                </div>
                <div className="flex justify-between gap-4 py-2.5 border-b border-slate-50">
                  <span className="text-slate-400">Industry</span>
                  <span className="font-medium text-[#071A33]">{project.industry}</span>
                </div>
                <div className="flex justify-between gap-4 py-2.5 border-b border-slate-50">
                  <span className="text-slate-400">Year</span>
                  <span className="font-medium text-[#071A33]">{project.year}</span>
                </div>
                {project.status && (
                  <div className="flex justify-between gap-4 py-2.5">
                    <span className="text-slate-400">Status</span>
                    <span className="px-2.5 py-1 rounded-full bg-[#EAF4FF] border border-[#D4E8FF] text-[11px] font-semibold text-[#0057B8]">{project.status}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] leading-[1.6] text-slate-400 mt-6">
                Demo showcase — illustrative concept to demonstrate Corex IT&apos;s approach. Replace with verified client work when available.
              </p>
              <Link href="/contact" className="mt-6 flex items-center justify-center w-full py-3 rounded-full bg-[#0057B8] text-white text-[13px] font-semibold hover:bg-[#003B7A] transition-colors">
                Discuss a similar project
              </Link>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-100">
            <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-6">Related Projects</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/projects/${p.slug}`} className="group flex gap-4 rounded-[14px] border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                  <ProjectImage slug={p.slug} alt={p.title} className="w-28 h-20 object-cover rounded-[10px] shrink-0" />
                  <div>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-[#0057B8] font-semibold">{p.category}</p>
                    <h4 className="text-[15px] font-semibold text-[#071A33] group-hover:text-[#0057B8] transition-colors">{p.title}</h4>
                    <p className="text-[12px] leading-[1.5] text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 rounded-[18px] bg-[#071A33] text-white p-8 md:p-10 text-center">
          <h3 className="text-[22px] font-bold tracking-[-0.02em]">Have a similar idea?</h3>
          <p className="text-[14px] leading-[1.7] text-white/70 max-w-[560px] mx-auto mt-2">
            Let&apos;s discuss how Corex IT can help you design and build a reliable solution.
          </p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#071A33] text-[13px] font-semibold hover:bg-white/95 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
