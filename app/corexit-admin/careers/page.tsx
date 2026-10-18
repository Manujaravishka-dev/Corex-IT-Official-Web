"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

type Job = { id: string; title: string; category: string; employmentType: string; duration: string; location: string; description: string; technologies: string[]; responsibilities: string[]; requirements: string[]; published: boolean };
const blank: Job = { id: "", title: "", category: "", employmentType: "Internship", duration: "", location: "Remote", description: "", technologies: [], responsibilities: [], requirements: [], published: false };
export default function CareerManagement() {
  const [ready, setReady] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<Job>({ ...blank });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const token = async () => auth.currentUser?.getIdToken();
  const load = async () => {
    const t = await token();
    if (!t) throw Error("Admin login required");
    const res = await fetch("/api/career-jobs", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw Error(data.error || "Could not load roles");
    setJobs(data.jobs || []);
  };
  useEffect(() => onAuthStateChanged(auth, user => {
    if (!user) { window.location.href = "/corexit-admin-login"; return; }
    setReady(true);
    void load().catch(e => setError(e.message));
  }), []);
  const update = <K extends keyof Job>(key: K, value: Job[K]) => setForm(previous => ({ ...previous, [key]: value }));
  const save = async () => {
    setBusy(true); setError(""); setMessage("");
    try {
      const t = await token();
      const res = await fetch("/api/career-jobs", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || "Could not save role");
      await load(); setForm({ ...blank }); setMessage("Career role saved successfully.");
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this career role?")) return;
    setBusy(true); setError("");
    try {
      const t = await token();
      const res = await fetch(`/api/career-jobs?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) throw Error("Delete failed");
      await load(); setForm({ ...blank }); setMessage("Career role deleted.");
    } catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
    finally { setBusy(false); }
  };
  const field = (label: string, key: "title" | "category" | "employmentType" | "duration" | "location" | "description", multiline = false) => (
    <label className="block text-sm font-medium text-slate-700">{label}
      {multiline ? <textarea rows={3} value={form[key]} onChange={e => update(key, e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 p-3" /> :
      <input value={form[key]} onChange={e => update(key, e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 p-3" />}
    </label>
  );
  const listField = (label: string, key: "technologies" | "responsibilities" | "requirements", hint: string) => (
    <label className="block text-sm font-medium text-slate-700">{label}
      <textarea rows={key === "technologies" ? 2 : 5} placeholder={hint} value={form[key].join("\n")} onChange={e => update(key, e.target.value.split("\n").map(x => x.trim()).filter(Boolean))} className="mt-1 block w-full rounded-lg border border-slate-200 p-3" />
    </label>
  );
  if (!ready) return <div className="p-10">Checking admin access...</div>;
  return <main className="min-h-screen bg-slate-50 p-5 text-[#071A33] md:p-10">
    <div className="mx-auto max-w-6xl">
      <Link href="/corexit-admin" className="text-sm text-[#0057B8]">← Admin Dashboard</Link>
      <div className="my-6 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">Career Management</h1><Link href="/career" className="text-sm text-[#0057B8]">View Career Page →</Link></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-semibold">Career Roles ({jobs.length})</h2>
          {jobs.map(job => <div key={job.id} className="flex items-center justify-between gap-3 border-b py-4">
            <div><strong>{job.title}</strong><p className="text-xs text-slate-500">{job.category} · {job.published ? "Published" : "Draft"}</p></div>
            <div className="flex gap-3 text-sm"><button type="button" className="text-blue-700" onClick={() => { setForm({ ...blank, ...job }); setMessage(""); }}>Edit</button><button type="button" className="text-red-600" disabled={busy} onClick={() => void remove(job.id)}>Delete</button></div>
          </div>)}
          {jobs.length === 0 && <p className="text-sm text-slate-500">No career roles yet.</p>}
          <button type="button" onClick={() => { setForm({ ...blank }); setMessage(""); }} className="mt-5 font-semibold text-[#0057B8]">+ Add New Role</button>
        </section>
        <section className="space-y-4 rounded-xl border bg-white p-5">
          <h2 className="font-semibold">{form.id ? "Edit Career Role" : "Add Career Role"}</h2>
          {field("Job Title *", "title")}{field("Category *", "category")}{field("Employment Type", "employmentType")}{field("Duration", "duration")}{field("Location", "location")}{field("Short Description", "description", true)}
          {listField("Key Stack (one per line)", "technologies", "Jira\nConfluence\nFigma")}
          {listField("Key Responsibilities (one per line)", "responsibilities", "Add one responsibility per line")}
          {listField("Target Skills & Requirements (one per line)", "requirements", "Add one requirement per line")}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e => update("published", e.target.checked)} /> Publish on website</label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {message && <p role="status" className="text-sm text-green-700">{message}</p>}
          <button type="button" disabled={busy || !form.title.trim() || !form.category.trim()} onClick={() => void save()} className="rounded-lg bg-[#0057B8] px-6 py-3 text-white disabled:opacity-50">{busy ? "Saving..." : form.id ? "Update Role" : "Save Role"}</button>
        </section>
      </div>
    </div>
  </main>;
}
