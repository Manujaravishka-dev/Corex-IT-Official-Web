"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Job = { id: string; title: string; category: string; employmentType?: string; duration?: string; location?: string; description?: string; technologies?: string[]; responsibilities?: string[]; requirements?: string[] };
export function OpenCareerRoles() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetch("/api/career-jobs", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw Error("Failed to load roles");
      const data = await response.json();
      if (mounted) setJobs(data.jobs || []);
    }).catch(() => { if (mounted) setError(true); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(jobs.map(job => job.category).filter(Boolean)))], [jobs]);
  const filtered = active === "All" ? jobs : jobs.filter(job => job.category === active);
  return <section id="open-roles" className="mx-auto max-w-[1120px] px-5 pb-20 pt-8 md:px-8 md:pb-28">
    <h2 className="text-3xl font-bold tracking-tight text-black md:text-5xl">Explore Open Roles</h2>
    <p className="mt-3 max-w-[570px] text-sm leading-6 text-slate-500">Explore current opportunities at COREX IT and review the skills and responsibilities for each position.</p>
    <div className="mb-10 mt-8 flex flex-wrap gap-2">
      {categories.map(category => <button key={category} type="button" onClick={() => setActive(category)} className={`border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${active === category ? "border-[#0057B8] bg-[#0057B8] text-white" : "border-slate-300 bg-white text-[#071A33] hover:border-[#0057B8]"}`}>{category}</button>)}
    </div>
    {loading ? <p className="text-slate-500">Loading open roles...</p> : error ? <p role="alert" className="text-red-600">Career opportunities are temporarily unavailable.</p> : filtered.length === 0 ? <p className="border border-slate-200 p-8 text-slate-500">No open roles in this category at the moment.</p> :
      <div className="space-y-5">{filtered.map(job => <article key={job.id} className="border border-slate-200 bg-white p-5 md:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500"><span className="bg-[#0057B8] px-2.5 py-1 font-semibold uppercase text-white">{job.category}</span><span>{[job.employmentType, job.duration].filter(Boolean).join(" · ")}</span><span>{job.location ? "⌖ " + job.location : ""}</span></div>
            <h3 className="text-2xl font-bold tracking-tight text-[#071A33]">{job.title}</h3>
            {job.description && <p className="mt-2 max-w-[700px] text-sm leading-6 text-slate-600">{job.description}</p>}
          </div>
          <Link href={`/contact?subject=${encodeURIComponent("Career application: " + job.title)}`} className="inline-flex shrink-0 items-center justify-center gap-3 bg-[#0057B8] px-6 py-3 text-xs font-bold uppercase text-white hover:bg-[#003F8C]">Apply Now <span aria-hidden="true">→</span></Link>
        </div>
        {!!job.technologies?.length && <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-5"><span className="mr-2 text-xs font-semibold uppercase text-slate-400">Key Stack:</span>{job.technologies.map((technology, index) => <span key={index} className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-[#071A33]">{technology}</span>)}</div>}
        {(!!job.responsibilities?.length || !!job.requirements?.length) && <div className="mt-6 grid gap-8 border-t border-slate-100 pt-6 md:grid-cols-2">
          <div><h4 className="mb-4 text-xs font-bold uppercase text-[#071A33]">Key Responsibilities:</h4><ul className="space-y-3">{(job.responsibilities || []).map((item, index) => <li key={index} className="flex gap-2 text-xs leading-5 text-slate-600"><span className="shrink-0 text-[#0057B8]">✓</span>{item}</li>)}</ul></div>
          <div><h4 className="mb-4 text-xs font-bold uppercase text-[#071A33]">Target Skills & Requirements:</h4><ul className="space-y-3">{(job.requirements || []).map((item, index) => <li key={index} className="flex gap-2 text-xs leading-5 text-slate-600"><span className="shrink-0 text-[#0057B8]">✓</span>{item}</li>)}</ul></div>
        </div>}
      </article>)}</div>}
  </section>;
}
