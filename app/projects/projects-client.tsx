"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ProjectRecord } from "@/lib/project-record";
import { ProjectsHero } from "@/components/projects-hero";

export default function ProjectsClient() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [active, setActive] = useState("All Projects");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getDocs(collection(db,"projects")).then(snap => {
      setProjects(snap.docs.map(d=>({ ...d.data(), id:d.id } as ProjectRecord)).filter(p=>p.isPublished).sort((a,b)=>a.sortOrder-b.sortOrder));
    }).catch(err=>console.error("Failed to load projects",err)).finally(()=>setLoading(false));
  },[]);
  const categories = useMemo(()=>["All Projects",...new Set(projects.map(p=>p.category))], [projects]);
  const filtered = active === "All Projects" ? projects : projects.filter(p=>p.category===active);
  return <div className="bg-white"><ProjectsHero />
    <div className="sticky top-[76px] z-20 bg-white/95 border-b border-slate-100"><div className="max-w-[1280px] mx-auto px-6 flex gap-2 overflow-x-auto py-4">{categories.map(c=><button key={c} onClick={()=>setActive(c)} className={`shrink-0 px-4 py-2 rounded-lg text-sm ${active===c?"bg-[#0056B8] text-white":"bg-[#EDF2F8] text-[#263B56]"}`}>{c}</button>)}</div></div>
    <section className="max-w-[1280px] mx-auto px-6 py-12">
      {loading ? <p>Loading projects…</p> : filtered.length===0 ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center"><h2 className="text-xl font-semibold">No public projects yet</h2><p className="mt-3 text-slate-500">Published case studies will appear here.</p></div> :
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{filtered.map(p=><article key={p.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="h-56 bg-[#EDF2F8]">{p.imageUrl ? <img src={p.imageUrl} alt={p.title} loading="lazy" className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center font-bold text-[#0056B8]">COREX IT</div>}</div>
        <div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-[#0056B8]">{p.category} · {p.year}</p><h2 className="text-xl font-bold mt-2">{p.title}</h2><p className="text-sm text-slate-600 leading-6 mt-3">{p.description}</p><div className="flex flex-wrap gap-2 mt-4">{(p.technologies||[]).map(t=><span key={t} className="text-xs rounded-full bg-[#EDF2F8] px-3 py-1">{t}</span>)}</div><Link href="/contact" className="inline-block text-[#0056B8] font-semibold text-sm mt-6">Discuss a similar project →</Link></div>
      </article>)}</div>}
    </section></div>;
}
