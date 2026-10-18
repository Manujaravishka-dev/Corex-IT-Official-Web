"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { ProjectRecord } from "@/lib/project-record";

type Form = Omit<ProjectRecord, "id">;
const empty: Form = { title: "", category: "Web Application", description: "", imageUrl: "", imagePublicId: "", technologies: [], year: String(new Date().getFullYear()), isPublished: false, sortOrder: 0 };
export default function AdminProjects() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<ProjectRecord[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [tech, setTech] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    const snap = await getDocs(collection(db, "projects"));
    setItems(snap.docs.map(d => ({ ...d.data(), id: d.id } as ProjectRecord)).sort((a,b) => a.sortOrder - b.sortOrder));
  };
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setChecking(false); if (u) void load().catch(e => setError(String(e))); }), []);
  const edit = (p: ProjectRecord) => { setEditing(p.id); setForm({ title:p.title, category:p.category, description:p.description, imageUrl:p.imageUrl, imagePublicId:p.imagePublicId || "", technologies:p.technologies || [], year:p.year, isPublished:p.isPublished, sortOrder:p.sortOrder }); setTech((p.technologies || []).join(", ")); setFile(null); };
  const save = async (e: FormEvent) => {
    e.preventDefault(); if (!user) return; setBusy(true); setError("");
    try {
      let values = { ...form, title:form.title.trim(), description:form.description.trim(), technologies:tech.split(",").map(s=>s.trim()).filter(Boolean) };
      if (!values.title || !values.description) throw new Error("Title and description are required");
      if (file) {
        const body = new FormData(); body.append("file", file);
        const response = await fetch("/api/admin/upload-project-image", { method:"POST", headers:{ Authorization:`Bearer ${await user.getIdToken()}` }, body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
        values = { ...values, imageUrl:data.imageUrl, imagePublicId:data.publicId };
      }
      if (editing) await updateDoc(doc(db,"projects",editing), { ...values, updatedAt:serverTimestamp() });
      else await addDoc(collection(db,"projects"), { ...values, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
      setForm(empty); setTech(""); setFile(null); setEditing(null); await load();
    } catch(e) { setError(e instanceof Error ? e.message : "Unable to save project"); }
    finally { setBusy(false); }
  };
  const remove = async (p: ProjectRecord) => {
    if (!confirm(`Delete ${p.title}? The Cloudinary image will remain in storage.`)) return;
    try { await deleteDoc(doc(db,"projects",p.id)); await load(); } catch(e) { setError(String(e)); }
  };
  if (checking) return <main className="p-10">Checking access…</main>;
  if (!user) return <main className="p-10"><Link href="/corexit-admin-login" className="text-blue-700">Sign in to manage projects</Link></main>;
  return <main className="min-h-screen bg-[#F6F8FB] px-5 py-10 text-[#071A33]"><div className="max-w-5xl mx-auto space-y-8">
    <div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Project Management</h1><p className="text-slate-500 mt-2">Publish real work to the public Projects page. Images upload to Cloudinary.</p></div><Link href="/corexit-admin" className="text-[#0056B8] font-medium">← Admin dashboard</Link></div>
    {error && <p role="alert" className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</p>}
    <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-6 grid md:grid-cols-2 gap-4">
      <h2 className="md:col-span-2 text-xl font-semibold">{editing ? "Edit project" : "Add project"}</h2>
      <label className="grid gap-1 text-sm">Title<input required className="border rounded-lg p-3" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Category<input className="border rounded-lg p-3" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Year<input className="border rounded-lg p-3" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Display order<input type="number" className="border rounded-lg p-3" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})}/></label>
      <label className="grid gap-1 text-sm md:col-span-2">Description<textarea required rows={4} className="border rounded-lg p-3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <label className="grid gap-1 text-sm">Technologies (comma separated)<input className="border rounded-lg p-3" value={tech} onChange={e=>setTech(e.target.value)}/></label>
      <label className="grid gap-1 text-sm">Project image<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" onChange={e=>setFile(e.target.files?.[0] || null)} className="border rounded-lg p-3"/>{form.imageUrl && <a href={form.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700">View current image</a>}</label>
      <label className="flex items-center gap-2 md:col-span-2"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form,isPublished:e.target.checked})}/> Published (visible to visitors)</label>
      <div className="flex gap-3 md:col-span-2"><button disabled={busy} className="bg-[#0056B8] text-white px-6 py-3 rounded-lg disabled:opacity-50">{busy ? "Saving…" : editing ? "Update project" : "Create project"}</button>{editing && <button type="button" onClick={()=>{setEditing(null);setForm(empty);setTech("");setFile(null);}} className="px-5 py-3 border rounded-lg">Cancel</button>}</div>
    </form>
    <div className="space-y-3">{items.map(p=><div key={p.id} className="bg-white border rounded-xl p-4 flex items-center gap-4">{p.imageUrl && <img src={p.imageUrl} alt="" className="w-20 h-16 object-cover rounded-lg"/>}<div className="flex-1"><p className="font-semibold">{p.title}</p><p className="text-sm text-slate-500">{p.category} · {p.isPublished ? "Published" : "Draft"}</p></div><button onClick={()=>edit(p)} className="text-blue-700">Edit</button><button onClick={()=>void remove(p)} className="text-red-600">Delete</button></div>)}</div>
  </div></main>;
}
