"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import {
  COLLECTIONS,
  SETTINGS_DOC_ID,
  COMPANY_HIGHLIGHTS_DOC_ID,
  DEFAULT_COMPANY_HIGHLIGHTS,
  DEFAULT_CLIENT_BRANDS,
  type CompanyHighlights,
  type Testimonial,
  type TestimonialInvite,
  type ContactMessage,
  type CompanySettings,
  type WebsiteImage,
  type WebsiteImageCategory,
  type Blog,
  type ClientBrand,
  BLOG_CATEGORIES,
} from "@/lib/firestore-types";
import { defaultCompanySettings } from "@/lib/site-settings";

// Types for admin UI
type Tab = "dashboard" | "testimonials" | "messages" | "images" | "blogs" | "company-highlights" | "client-brands" | "settings";

// Company Highlights form state — mirrors the company_highlights/main document
type CompanyHighlightsForm = {
  projectsCompleted: number;
  projectsSuffix: string;
  happyClients: number;
  clientsSuffix: string;
  teamMembers: number;
  teamSuffix: string;
  yearsExperience: number;
  yearsSuffix: string;
};

const BLOG_COVER_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
const BLOG_COVER_MAX_SIZE = 10 * 1024 * 1024; // 10MB — matches server

function formatDate(value: Timestamp | Date | string | undefined): string {
  try {
    if (!value) return "—";
    let d: Date;
    if (value instanceof Timestamp) d = value.toDate();
    else if (value instanceof Date) d = value;
    else d = new Date(value as string);
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(value);
  }
}

function coerceNum(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function coerceStr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

// Single row in the Company Highlights admin form: value + suffix inputs.
function HighlightField({
  label,
  value,
  suffix,
  onValue,
  onSuffix,
}: {
  label: string;
  value: number;
  suffix: string;
  onValue: (v: number) => void;
  onSuffix: (s: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 items-end">
      <div>
        <label className="block text-[11px] font-medium text-slate-700 mb-1.5">{label}</label>
        <input
          type="number"
          min={0}
          step={1}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onValue(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Suffix</label>
        <input
          value={suffix}
          onChange={(e) => onSuffix(e.target.value)}
          placeholder="+"
          maxLength={5}
          className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]"
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");

  // Data
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [loadingData, setLoadingData] = useState(true);

  // Testimonials form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tForm, setTForm] = useState({
    name: "",
    company: "",
    designation: "",
    comment: "",
    rating: 5,
    status: "published" as "published" | "hidden" | "pending",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tSubmitting, setTSubmitting] = useState(false);
  const [tError, setTError] = useState<string | null>(null);

  // One-time testimonial invite links
  const [invites, setInvites] = useState<TestimonialInvite[]>([]);
  const [inviteNote, setInviteNote] = useState("");
  const [inviteExpiryDays, setInviteExpiryDays] = useState("7");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Messages filter/search
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "read" | "replied">("all");

  // Settings edit
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Website Images state
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [imageFilter, setImageFilter] = useState<WebsiteImageCategory | "all">("all");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageEditing, setImageEditing] = useState<WebsiteImage | null>(null);
  const [imgForm, setImgForm] = useState({
    title: "",
    altText: "",
    description: "",
    category: "hero" as WebsiteImageCategory,
    isActive: true,
    sortOrder: 0,
  });
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgSuccess, setImgSuccess] = useState<string | null>(null);

  // Blog Management state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogEditing, setBlogEditing] = useState<Blog | null>(null);
  const [bForm, setBForm] = useState({
    title: "",
    authorName: "",
    mediumUrl: "",
    coverImage: "",
    description: "",
    category: "",
  });
  const [blogSubmitting, setBlogSubmitting] = useState(false);

  // Company Highlights state — single document (company_highlights/main)
  const [highlightForm, setHighlightForm] = useState<CompanyHighlightsForm>({ ...DEFAULT_COMPANY_HIGHLIGHTS });
  const [highlightLoading, setHighlightLoading] = useState(true);
  const [highlightSaving, setHighlightSaving] = useState(false);
  const [highlightError, setHighlightError] = useState<string | null>(null);
  const [highlightSuccess, setHighlightSuccess] = useState<string | null>(null);
  const [bError, setBError] = useState<string | null>(null);
  const [bSuccess, setBSuccess] = useState<string | null>(null);
  const [blogCoverUploading, setBlogCoverUploading] = useState(false);

  // Client Brands state
  const [clientBrands, setClientBrands] = useState<ClientBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandEditing, setBrandEditing] = useState<ClientBrand | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: "",
    logoUrl: "",
    websiteUrl: "",
    isActive: true,
    displayOrder: 0,
  });
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [brandSubmitting, setBrandSubmitting] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [brandSuccess, setBrandSuccess] = useState<string | null>(null);
  const [brandLogoUploading, setBrandLogoUploading] = useState(false);

  // Auth guard — reuse existing Firebase Auth instance, wait for initialization
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      if (!u) {
        setUserEmail(null);
        setAuthLoading(false);
        router.replace("/corexit-admin-login");
      } else {
        setUserEmail(u.email);
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // Company Highlights — load (and seed if missing) the single company_highlights/main document.
  // Uses the client Firestore SDK (same document the public Home page reads), mirroring Settings.
  const fetchCompanyHighlights = async () => {
    setHighlightLoading(true);
    setHighlightError(null);
    try {
      const ref = doc(db, COLLECTIONS.companyHighlights, COMPANY_HIGHLIGHTS_DOC_ID);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data() as Partial<CompanyHighlights>;
        setHighlightForm({
          projectsCompleted: coerceNum(d.projectsCompleted, DEFAULT_COMPANY_HIGHLIGHTS.projectsCompleted),
          projectsSuffix: coerceStr(d.projectsSuffix, DEFAULT_COMPANY_HIGHLIGHTS.projectsSuffix),
          happyClients: coerceNum(d.happyClients, DEFAULT_COMPANY_HIGHLIGHTS.happyClients),
          clientsSuffix: coerceStr(d.clientsSuffix, DEFAULT_COMPANY_HIGHLIGHTS.clientsSuffix),
          teamMembers: coerceNum(d.teamMembers, DEFAULT_COMPANY_HIGHLIGHTS.teamMembers),
          teamSuffix: coerceStr(d.teamSuffix, DEFAULT_COMPANY_HIGHLIGHTS.teamSuffix),
          yearsExperience: coerceNum(d.yearsExperience, DEFAULT_COMPANY_HIGHLIGHTS.yearsExperience),
          yearsSuffix: coerceStr(d.yearsSuffix, DEFAULT_COMPANY_HIGHLIGHTS.yearsSuffix),
        });
        setHighlightSuccess(null);
      } else {
        // Document does not exist yet — initialize it with the sample values so it is editable.
        await setDoc(
          ref,
          { ...DEFAULT_COMPANY_HIGHLIGHTS, updatedAt: serverTimestamp() },
          { merge: true }
        );
        setHighlightForm({ ...DEFAULT_COMPANY_HIGHLIGHTS });
        setHighlightSuccess("Company highlights initialized with default values.");
        setTimeout(() => setHighlightSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Failed to load company highlights (admin)", err);
      setHighlightError(err instanceof Error ? err.message : "Failed to load company highlights.");
    } finally {
      setHighlightLoading(false);
    }
  };

  // Client Brands — load all brands from the client_brands collection.
  const fetchClientBrands = async () => {
    setBrandsLoading(true);
    setBrandError(null);
    try {
      const q = query(collection(db, COLLECTIONS.clientBrands), orderBy("displayOrder", "asc"));
      const snap = await getDocs(q);
      setClientBrands(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClientBrand, "id">) })));
    } catch (err) {
      console.error("Failed to load client brands (admin)", err);
      setBrandError(err instanceof Error ? err.message : "Failed to load client brands.");
    } finally {
      setBrandsLoading(false);
    }
  };

  // Fetch data — only after auth is confirmed (wait for onAuthStateChanged)
  // Each collection is fetched independently so a failure in one (e.g., invites API) does NOT block the others.
  async function fetchAll() {
    const user = auth.currentUser;
    if (!user) {
      console.error("Failed to load admin data: auth not ready or unauthenticated — waiting for onAuthStateChanged");
      setInviteError("Admin authentication required.");
      return;
    }
    setLoadingData(true);

    // 1) Testimonials (existing admin CRUD must continue to work)
    try {
      const tSnap = await getDocs(query(collection(db, COLLECTIONS.testimonials), orderBy("createdAt", "desc")));
      setTestimonials(tSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, "id">) })));
    } catch (err) {
      console.error("Failed to load testimonials (admin)", err);
      // keep previous testimonials (or empty) so panel still renders
    }

    // 2) Contact messages
    try {
      const mSnap = await getDocs(query(collection(db, COLLECTIONS.contactMessages), orderBy("createdAt", "desc")));
      setMessages(mSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, "id">) })));
    } catch (err) {
      console.error("Failed to load contact messages (admin)", err);
    }

    // 3) Settings
    try {
      const sSnap = await getDoc(doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID));
      if (sSnap.exists()) {
        setSettings({ ...defaultCompanySettings, ...(sSnap.data() as CompanySettings) });
      }
    } catch (err) {
      console.error("Failed to load settings (admin)", err);
    }

    // 4) Website Images
    try {
      const iSnap = await getDocs(query(collection(db, COLLECTIONS.websiteImages), orderBy("createdAt", "desc")));
      setImages(iSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WebsiteImage, "id">) })));
    } catch (err) {
      console.error("Failed to load website images (admin)", err);
    }

    // 5) Blogs
    try {
      const bSnap = await getDocs(query(collection(db, COLLECTIONS.blogs), orderBy("createdAt", "desc")));
      setBlogs(bSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Blog, "id">) })));
    } catch (err) {
      console.error("Failed to load blogs (admin)", err);
    }

    // 6) Client Brands
    try {
      await fetchClientBrands();
    } catch (err) {
      console.error("Failed to load client brands (admin)", err);
    }

    // 7) Invites via secure server API (Admin SDK) — additive only, must NOT block existing panel
    // Uses existing Firebase Auth instance; waits for onAuthStateChanged (authUser) — never localStorage/URL
    // Sends Authorization: Bearer <ID_TOKEN> exactly as required
    try {
      // Reuse the user from onAuthStateChanged (authUser) or fallback to auth.currentUser
      // auth.currentUser can be temporarily null right after page load, so we wait for authUser.
      const inviteUser = user;
      if (!inviteUser) {
        console.error("Failed to load testimonial invites (admin) — no authenticated user");
        setInviteError("Admin authentication required.");
        setInvites([]);
      } else {
        let idToken: string | null = null;
        try {
          // Obtain ID token from the initialized Firebase user (existing Auth instance)
          idToken = await inviteUser.getIdToken();
        } catch (tokenErr) {
          console.error("Failed to load testimonial invites (admin) — getIdToken failed", tokenErr);
          setInviteError("Admin authentication token is invalid. Please sign in again.");
        }
        if (!idToken) {
          console.error("Failed to load testimonial invites (admin) — no ID token");
          setInviteError("Admin authentication token is invalid. Please sign in again.");
          setInvites([]);
        } else {
          let res: Response | null = null;
          try {
            res = await fetch("/api/testimonial-invites", {
              headers: { Authorization: `Bearer ${idToken}` },
              cache: "no-store",
            });
          } catch (fetchErr) {
            console.error("Failed to load testimonial invites (admin) — fetch network error", fetchErr);
            setInviteError("Admin authentication token is invalid. Please sign in again.");
            setInvites([]);
            res = null;
          }
          if (res) {
            if (res.ok) {
              try {
                const data = await res.json();
                const fetched = (data.invites as TestimonialInvite[]) || [];
                const normalized = fetched.map((inv) => {
                  const status = (inv.status as string) || ((inv as unknown as { used?: boolean }).used ? "used" : "unused");
                  return { ...inv, status: status as TestimonialInvite["status"], used: status === "used" };
                });
                setInvites(normalized as TestimonialInvite[]);
                setInviteError(null);
              } catch (parseErr) {
                console.error("Failed to load testimonial invites (admin) — JSON parse error", parseErr);
                setInvites([]);
              }
            } else {
              let errText = "";
              try { errText = await res.text(); } catch { /* ignore */ }
              if (res.status === 401) {
                console.error("Failed to load testimonial invites (admin) — 401 Unauthorized", errText);
                setInviteError("Admin authentication token is invalid. Please sign in again.");
              } else if (res.status === 503) {
                console.error("Failed to load testimonial invites (admin) — 503 Admin SDK not configured", errText);
                setInviteError(errText || "Firebase Admin not configured on server");
              } else {
                console.error("Failed to load testimonial invites (admin)", res.status, errText);
                setInviteError("Failed to load testimonial invites.");
              }
              setInvites([]);
            }
          }
        }
      }
    } catch (inviteErr) {
      console.error("Failed to load testimonial invites (admin) — unexpected", inviteErr);
      setInviteError("Admin authentication token is invalid. Please sign in again.");
      setInvites([]);
    }

    setLoadingData(false);
  }

  useEffect(() => {
    // Wait for Firebase Auth state initialization (onAuthStateChanged) — authUser is set there.
    // Do NOT call with auth.currentUser that may be temporarily null after page load.
    if (!authLoading && authUser) fetchAll();
  }, [authLoading, authUser]);

  // Company Highlights — load the current values whenever the tab is opened.
  const handleTabClick = (id: Tab) => {
    setTab(id);
    if (id === "company-highlights") {
      void fetchCompanyHighlights();
    }
    if (id === "client-brands") {
      void fetchClientBrands();
    }
  };

  // Dashboard stats
  const stats = useMemo(() => {
    const totalTestimonials = testimonials.length;
    const published = testimonials.filter((t) => t.status === "published").length;
    const hidden = testimonials.filter((t) => t.status === "hidden").length;
    const pending = testimonials.filter((t) => t.status === "pending").length;
    const totalMessages = messages.length;
    const newMessages = messages.filter((m) => m.status === "new").length;
    const readMessages = messages.filter((m) => m.status === "read").length;
    const repliedMessages = messages.filter((m) => m.status === "replied").length;
    return { totalTestimonials, published, hidden, pending, totalMessages, newMessages, readMessages, repliedMessages };
  }, [testimonials, messages]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${m.fullName} ${m.email} ${m.phone} ${m.company} ${m.subject} ${m.message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [messages, search, filterStatus]);

  // Testimonials CRUD
  const resetTForm = () => {
    setEditingId(null);
    setTForm({ name: "", company: "", designation: "", comment: "", rating: 5, status: "published", imageUrl: "" });
    setImageFile(null);
    setTError(null);
  };

  const handleEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setTForm({
      name: t.name,
      company: t.company || "",
      designation: t.designation || "",
      comment: t.comment,
      rating: t.rating,
      status: t.status,
      imageUrl: t.imageUrl || "",
    });
    setImageFile(null);
    setTab("testimonials");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.testimonials, id));
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to update testimonial (delete)", err);
      alert(err instanceof Error ? err.message : "Failed to delete testimonial");
    }
  };

  const handleToggleStatus = async (t: Testimonial) => {
    // Pending testimonials: publish them; otherwise toggle published/hidden
    const newStatus: Testimonial["status"] = t.status === "pending" ? "published" : t.status === "published" ? "hidden" : "published";
    try {
      await updateDoc(doc(db, COLLECTIONS.testimonials, t.id), { status: newStatus });
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: newStatus } : x)));
    } catch (err) {
      console.error("Failed to update testimonial (toggle status)", err);
      alert(err instanceof Error ? err.message : "Failed to update testimonial");
    }
  };

  const handlePublishPending = async (t: Testimonial) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.testimonials, t.id), { status: "published" });
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: "published" as const } : x)));
    } catch (err) {
      console.error("Failed to publish pending testimonial", err);
      alert(err instanceof Error ? err.message : "Failed to publish testimonial");
    }
  };

  // One-time invite link generation (admin only) — via secure server API (Admin SDK)
  // Must use existing Firebase Auth instance and send Authorization: Bearer <ID_TOKEN>
  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setGeneratedLink(null);
    setGeneratingInvite(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setInviteError("Admin authentication required.");
        throw new Error("Admin authentication required.");
      }
      let idToken: string | null = null;
      try {
        idToken = await user.getIdToken();
      } catch {
        setInviteError("Admin authentication token is invalid. Please sign in again.");
        throw new Error("Admin authentication token is invalid. Please sign in again.");
      }
      if (!idToken) {
        setInviteError("Admin authentication token is invalid. Please sign in again.");
        throw new Error("Admin authentication token is invalid. Please sign in again.");
      }
      const res = await fetch("/api/testimonial-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ note: inviteNote.trim(), expiryDays: Number(inviteExpiryDays) || 7 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          setInviteError("Admin authentication token is invalid. Please sign in again.");
          throw new Error("Admin authentication token is invalid. Please sign in again.");
        }
        throw new Error((data.error as string) || `Failed to generate invite (${res.status})`);
      }
      const rawToken = data.token as string;
      const url = (data.url as string) || `${window.location.origin}/testimonial/${rawToken}`;
      setGeneratedLink(url);
      // Refresh invites list from server (authoritative)
      try {
        const listRes = await fetch("/api/testimonial-invites", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
        if (listRes.ok) {
          const jd = await listRes.json();
          const fetched = (jd.invites as TestimonialInvite[]) || [];
          const normalized = fetched.map((inv) => ({ ...inv, status: ((inv.status as string) || (inv.used ? "used" : "unused")) as TestimonialInvite["status"], used: ((inv.status as string) || (inv.used ? "used" : "unused")) === "used" }));
          setInvites(normalized as TestimonialInvite[]);
        } else {
          // optimistic fallback
          const expiresAt = new Date(Date.now() + (Number(inviteExpiryDays) || 7) * 24 * 60 * 60 * 1000);
          setInvites((prev) => [{ id: data.tokenHash as string, tokenHash: data.tokenHash as string, status: "unused" as const, createdAt: new Date().toISOString(), expiresAt: expiresAt.toISOString(), usedAt: null, createdBy: userEmail || "", note: inviteNote.trim() || "", used: false } as unknown as TestimonialInvite, ...prev]);
        }
      } catch { /* ignore */ }
      setInviteNote("");
    } catch (err) {
      console.error("Failed to generate invite", err);
      setInviteError(err instanceof Error ? err.message : "Failed to generate invite link.");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      // fallback
      const el = document.createElement("input");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const handleDeleteInvite = async (tokenOrHash: string) => {
    if (!confirm("Delete this invite link? This cannot be undone.")) return;
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Admin authentication required.");
        return;
      }
      let idToken: string | null = null;
      try {
        idToken = await user.getIdToken();
      } catch {
        alert("Admin authentication token is invalid. Please sign in again.");
        return;
      }
      if (!idToken) {
        alert("Admin authentication token is invalid. Please sign in again.");
        return;
      }
      const res = await fetch("/api/testimonial-invites/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ tokenHash: tokenOrHash, token: tokenOrHash }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          alert("Admin authentication token is invalid. Please sign in again.");
          return;
        }
        if (res.status === 404) {
          // Already deleted — remove from UI gracefully, no fatal error
          setInvites((prev) => prev.filter((x) => x.id !== tokenOrHash && (x as unknown as { tokenHash: string }).tokenHash !== tokenOrHash && x.token !== tokenOrHash));
          if (generatedLink && generatedLink.includes(tokenOrHash)) setGeneratedLink(null);
          return;
        }
        throw new Error((data.error as string) || `Failed to delete invite (${res.status})`);
      }
      // Success — remove from UI immediately, no console error
      setInvites((prev) => prev.filter((x) => x.id !== tokenOrHash && (x as unknown as { tokenHash: string }).tokenHash !== tokenOrHash && x.token !== tokenOrHash));
      if (generatedLink && generatedLink.includes(tokenOrHash)) setGeneratedLink(null);
    } catch (err) {
      console.error("Failed to delete invite", err);
      alert(err instanceof Error ? err.message : "Failed to delete invite");
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTError(null);
    if (!tForm.name.trim() || !tForm.comment.trim()) {
      setTError("Name and comment are required.");
      return;
    }
    // Client-side validation per spec
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        setTError("Only image files are allowed.");
        setTSubmitting(false);
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        setTError("Image must be under 5MB.");
        setTSubmitting(false);
        return;
      }
    }
    setTSubmitting(true);
    try {
      let imageUrl = tForm.imageUrl;
      // If file selected, upload to Storage at required path
      if (imageFile) {
        const fileName = `testimonials/customer-images/${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        name: tForm.name.trim(),
        company: tForm.company.trim(),
        designation: tForm.designation.trim(),
        comment: tForm.comment.trim(),
        rating: Number(tForm.rating),
        status: tForm.status,
        imageUrl: imageUrl || "",
        createdAt: serverTimestamp(),
      };

      if (editingId) {
        try {
          await updateDoc(doc(db, COLLECTIONS.testimonials, editingId), {
            name: payload.name,
            company: payload.company,
            designation: payload.designation,
            comment: payload.comment,
            rating: payload.rating,
            status: payload.status,
            ...(imageFile || tForm.imageUrl ? { imageUrl: payload.imageUrl } : {}),
          });
          setTestimonials((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...payload, id: editingId, createdAt: t.createdAt, imageUrl: payload.imageUrl } as Testimonial : t)));
        } catch (err) {
          console.error("Failed to update testimonial", err);
          throw err;
        }
      } else {
        try {
          const refDoc = await addDoc(collection(db, COLLECTIONS.testimonials), payload);
          setTestimonials((prev) => [{ id: refDoc.id, ...payload } as Testimonial, ...prev]);
        } catch (err) {
          console.error("Failed to update testimonial (create)", err);
          throw err;
        }
      }
      resetTForm();
    } catch (err: unknown) {
      console.error("Failed to update testimonial", err);
      setTError(err instanceof Error ? err.message : "Failed to save testimonial.");
    } finally {
      setTSubmitting(false);
    }
  };

  // Messages actions
  const handleUpdateMessageStatus = async (id: string, status: ContactMessage["status"]) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.contactMessages, id), { status });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    } catch (err) {
      console.error("Failed to update contact message status", err);
      alert(err instanceof Error ? err.message : "Failed to update message");
    }
  };
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.contactMessages, id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete contact message", err);
      alert(err instanceof Error ? err.message : "Failed to delete message");
    }
  };

  // Settings save — uses setDoc(...,{merge:true}) on settings/company
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await setDoc(doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID), settings, { merge: true });
      alert("Settings saved.");
    } catch (err: unknown) {
      console.error("Failed to update settings", err);
      alert(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Website Images CRUD ──────────────────────────────────────────────────
  const filteredImages = useMemo(() => {
    if (imageFilter === "all") return images;
    return images.filter((img) => img.category === imageFilter);
  }, [images, imageFilter]);

  const imageStats = useMemo(() => {
    const total = images.length;
    const active = images.filter((img) => img.isActive).length;
    const byCategory: Record<string, number> = {};
    images.forEach((img) => {
      byCategory[img.category] = (byCategory[img.category] || 0) + 1;
    });
    return { total, active, byCategory };
  }, [images]);

  const resetImgForm = () => {
    setImageEditing(null);
    setImgForm({ title: "", altText: "", description: "", category: "hero", isActive: true, sortOrder: 0 });
    setImgFile(null);
    setImgError(null);
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImgError(null);
    setImgSuccess(null);
    if (!imgFile) {
      setImgError("Please select an image file.");
      return;
    }
    if (imgFile.size > 10 * 1024 * 1024) {
      setImgError("Image must be under 10MB.");
      return;
    }
    setImageUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setImgError("Admin authentication required.");
        setImageUploading(false);
        return;
      }
      const idToken = await user.getIdToken();
      const fd = new FormData();
      fd.append("file", imgFile);
      fd.append("category", imgForm.category);
      fd.append("title", imgForm.title);
      fd.append("altText", imgForm.altText);
      fd.append("description", imgForm.description);
      fd.append("isActive", String(imgForm.isActive));
      fd.append("sortOrder", String(imgForm.sortOrder));

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Upload failed (${res.status})`);
      }
      // Add the new image to state
      if (data.documentId) {
        const newImage: WebsiteImage = {
          id: data.documentId,
          title: data.title,
          category: data.category,
          imageUrl: data.secure_url,
          publicId: data.public_id,
          cloudinaryFolder: data.folder || "",
          altText: data.altText || "",
          description: data.description || "",
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setImages((prev) => [newImage, ...prev]);
      } else {
        // Firestore doc creation failed, reload from server
        const iSnap = await getDocs(query(collection(db, COLLECTIONS.websiteImages), orderBy("createdAt", "desc")));
        setImages(iSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WebsiteImage, "id">) })));
      }
      resetImgForm();
      setImgSuccess("Image uploaded successfully!");
      setTimeout(() => setImgSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to upload image", err);
      setImgError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleEditImage = (img: WebsiteImage) => {
    setImageEditing(img);
    setImgForm({
      title: img.title || "",
      altText: img.altText || "",
      description: img.description || "",
      category: img.category,
      isActive: img.isActive,
      sortOrder: img.sortOrder || 0,
    });
    setImgFile(null);
    setImgError(null);
    setImgSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateImageMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageEditing) return;
    setImgError(null);
    setImgSuccess(null);
    setImageUploading(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.websiteImages, imageEditing.id), {
        title: imgForm.title,
        altText: imgForm.altText,
        description: imgForm.description,
        category: imgForm.category,
        isActive: imgForm.isActive,
        sortOrder: imgForm.sortOrder,
        updatedAt: new Date().toISOString(),
      });
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageEditing.id
            ? { ...img, title: imgForm.title, altText: imgForm.altText, description: imgForm.description, category: imgForm.category, isActive: imgForm.isActive, sortOrder: imgForm.sortOrder }
            : img
        )
      );
      resetImgForm();
      setImgSuccess("Image updated successfully!");
      setTimeout(() => setImgSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to update image", err);
      setImgError(err instanceof Error ? err.message : "Failed to update image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleReplaceImage = async () => {
    if (!imageEditing || !imgFile) return;
    setImgError(null);
    setImgSuccess(null);
    setImageUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setImgError("Admin authentication required.");
        setImageUploading(false);
        return;
      }
      const idToken = await user.getIdToken();
      // 1) Upload new image
      const fd = new FormData();
      fd.append("file", imgFile);
      fd.append("category", imgForm.category);
      fd.append("title", imgForm.title);
      fd.append("altText", imgForm.altText);
      fd.append("description", imgForm.description);
      fd.append("isActive", String(imgForm.isActive));
      fd.append("sortOrder", String(imgForm.sortOrder));

      const uploadRes = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      // 2) Update Firestore document with new Cloudinary data
      await updateDoc(doc(db, COLLECTIONS.websiteImages, imageEditing.id), {
        imageUrl: uploadData.secure_url,
        publicId: uploadData.public_id,
        cloudinaryFolder: uploadData.folder || "",
        title: imgForm.title,
        altText: imgForm.altText,
        description: imgForm.description,
        category: imgForm.category,
        isActive: imgForm.isActive,
        sortOrder: imgForm.sortOrder,
        updatedAt: new Date().toISOString(),
      });

      // 3) Delete old Cloudinary asset
      try {
        const oldPublicId = imageEditing.publicId;
        const deleteRes = await fetch("/api/admin/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ publicId: oldPublicId }),
        });
        if (!deleteRes.ok) {
          console.warn("Old Cloudinary asset could not be deleted (non-critical)");
        }
      } catch {
        console.warn("Old Cloudinary asset cleanup failed (non-critical)");
      }

      // Update local state
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageEditing.id
            ? { ...img, imageUrl: uploadData.secure_url, publicId: uploadData.public_id, cloudinaryFolder: uploadData.folder || "", title: imgForm.title, altText: imgForm.altText, description: imgForm.description, category: imgForm.category, isActive: imgForm.isActive, sortOrder: imgForm.sortOrder }
            : img
        )
      );
      resetImgForm();
      setImgSuccess("Image replaced successfully!");
      setTimeout(() => setImgSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to replace image", err);
      setImgError(err instanceof Error ? err.message : "Failed to replace image.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteImage = async (img: WebsiteImage) => {
    if (!confirm(`Delete "${img.title || "untitled"}"? This will remove the image from Cloudinary and cannot be undone.`)) return;
    setImgError(null);
    setImgSuccess(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setImgError("Admin authentication required.");
        return;
      }
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ publicId: img.publicId, documentId: img.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      setImgSuccess("Image deleted successfully!");
      setTimeout(() => setImgSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to delete image", err);
      setImgError(err instanceof Error ? err.message : "Failed to delete image.");
    }
  };

  const handleToggleImageActive = async (img: WebsiteImage) => {
    try {
      const newActive = !img.isActive;
      await updateDoc(doc(db, COLLECTIONS.websiteImages, img.id), {
        isActive: newActive,
        updatedAt: new Date().toISOString(),
      });
      setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, isActive: newActive } : i)));
    } catch (err) {
      console.error("Failed to toggle image status", err);
      alert(err instanceof Error ? err.message : "Failed to update image");
    }
  };

  // ── Blog Management CRUD ──────────────────────────────────────────────────
  const handleBlogCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
    setBError(null);
    setBSuccess(null);
    if (!file) return;
    if (!BLOG_COVER_ACCEPT.split(",").includes(file.type)) {
      setBError("Please select an image file (JPG, PNG, WebP, GIF or AVIF).");
      return;
    }
    if (file.size > BLOG_COVER_MAX_SIZE) {
      setBError("Image must be under 10MB.");
      return;
    }
    setBlogCoverUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setBError("Admin authentication required.");
        setBlogCoverUploading(false);
        return;
      }
      const idToken = await user.getIdToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-blog-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Upload failed (${res.status})`);
      }
      setBForm((p) => ({ ...p, coverImage: data.secure_url }));
      setBSuccess("Cover image uploaded successfully!");
      setTimeout(() => setBSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to upload blog cover image", err);
      setBError(err instanceof Error ? err.message : "Failed to upload cover image.");
    } finally {
      setBlogCoverUploading(false);
    }
  };

  const resetBlogForm = () => {
    setBlogEditing(null);
    setBForm({ title: "", authorName: "", mediumUrl: "", coverImage: "", description: "", category: "" });
    setBError(null);
    setBSuccess(null);
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBError(null);
    setBSuccess(null);
    const title = bForm.title.trim();
    const mediumUrl = bForm.mediumUrl.trim();
    if (!title) {
      setBError("Blog title is required.");
      return;
    }
    if (!mediumUrl) {
      setBError("Medium article URL is required.");
      return;
    }
    if (!blogEditing && !bForm.coverImage.trim()) {
      setBError("Cover image is required. Please upload a cover image.");
      return;
    }
    setBlogSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.blogs), {
        title,
        authorName: bForm.authorName.trim(),
        mediumUrl,
        coverImage: bForm.coverImage.trim(),
        description: bForm.description.trim(),
        category: bForm.category.trim() || "General",
        createdAt: new Date().toISOString(),
      });
      const newBlog: Blog = {
        id: docRef.id,
        title,
        authorName: bForm.authorName.trim(),
        mediumUrl,
        coverImage: bForm.coverImage.trim(),
        description: bForm.description.trim(),
        category: bForm.category.trim() || "General",
        createdAt: new Date().toISOString(),
      };
      setBlogs((prev) => [newBlog, ...prev]);
      resetBlogForm();
      setBSuccess("Blog added successfully!");
      setTimeout(() => setBSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to add blog", err);
      setBError(err instanceof Error ? err.message : "Failed to add blog.");
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setBlogEditing(blog);
    setBForm({
      title: blog.title || "",
      authorName: blog.authorName || "",
      mediumUrl: blog.mediumUrl || "",
      coverImage: blog.coverImage || "",
      description: blog.description || "",
      category: blog.category || "",
    });
    setBError(null);
    setBSuccess(null);
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogEditing) return;
    setBError(null);
    setBSuccess(null);
    const title = bForm.title.trim();
    const mediumUrl = bForm.mediumUrl.trim();
    if (!title) {
      setBError("Blog title is required.");
      return;
    }
    if (!mediumUrl) {
      setBError("Medium article URL is required.");
      return;
    }
    setBlogSubmitting(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.blogs, blogEditing.id), {
        title,
        authorName: bForm.authorName.trim(),
        mediumUrl,
        coverImage: bForm.coverImage.trim(),
        description: bForm.description.trim(),
        category: bForm.category.trim() || "General",
      });
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogEditing.id
            ? { ...b, title, authorName: bForm.authorName.trim(), mediumUrl, coverImage: bForm.coverImage.trim(), description: bForm.description.trim(), category: bForm.category.trim() || "General" }
            : b
        )
      );
      resetBlogForm();
      setBSuccess("Blog updated successfully!");
      setTimeout(() => setBSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to update blog", err);
      setBError(err instanceof Error ? err.message : "Failed to update blog.");
    } finally {
      setBlogSubmitting(false);
    }
  };

  const handleDeleteBlog = async (blog: Blog) => {
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setBError(null);
    setBSuccess(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.blogs, blog.id));
      setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
      setBSuccess("Blog deleted successfully!");
      setTimeout(() => setBSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to delete blog", err);
      setBError(err instanceof Error ? err.message : "Failed to delete blog.");
    }
  };

  // Company Highlights — save edits to the single company_highlights/main document.
  const handleSaveHighlights = async (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightError(null);
    setHighlightSuccess(null);

    // Prevent invalid/negative numeric values
    const numericValues = [
      highlightForm.projectsCompleted,
      highlightForm.happyClients,
      highlightForm.teamMembers,
      highlightForm.yearsExperience,
    ];
    if (numericValues.some((v) => typeof v !== "number" || !Number.isFinite(v) || v < 0)) {
      setHighlightError("All values must be non-negative numbers.");
      return;
    }

    setHighlightSaving(true);
    try {
      const ref = doc(db, COLLECTIONS.companyHighlights, COMPANY_HIGHLIGHTS_DOC_ID);
      await setDoc(
        ref,
        {
          projectsCompleted: Number(highlightForm.projectsCompleted),
          projectsSuffix: highlightForm.projectsSuffix.trim(),
          happyClients: Number(highlightForm.happyClients),
          clientsSuffix: highlightForm.clientsSuffix.trim(),
          teamMembers: Number(highlightForm.teamMembers),
          teamSuffix: highlightForm.teamSuffix.trim(),
          yearsExperience: Number(highlightForm.yearsExperience),
          yearsSuffix: highlightForm.yearsSuffix.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setHighlightSuccess("Company highlights saved successfully!");
      setTimeout(() => setHighlightSuccess(null), 4000);
    } catch (err: unknown) {
      console.error("Failed to save company highlights (admin)", err);
      setHighlightError(err instanceof Error ? err.message : "Failed to save company highlights.");
    } finally {
      setHighlightSaving(false);
    }
  };

  // Client Brands CRUD
  const resetBrandForm = () => {
    setBrandEditing(null);
    setBrandForm({ name: "", logoUrl: "", websiteUrl: "", isActive: true, displayOrder: clientBrands.length + 1 });
    setBrandLogoFile(null);
    setBrandLogoPreview(null);
    setBrandError(null);
    setBrandSuccess(null);
  };

  const handleEditBrand = (brand: ClientBrand) => {
    setBrandEditing(brand);
    setBrandForm({
      name: brand.name,
      logoUrl: brand.logoUrl,
      websiteUrl: brand.websiteUrl || "",
      isActive: brand.isActive,
      displayOrder: brand.displayOrder,
    });
    setBrandLogoPreview(brand.logoUrl);
    setBrandLogoFile(null);
    setBrandError(null);
    setBrandSuccess(null);
    setTab("client-brands");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBrand = async (id: string, logoPublicId?: string) => {
    if (!confirm("Delete this brand?")) return;
    try {
      if (logoPublicId) {
        const res = await fetch("/api/admin/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await auth.currentUser?.getIdToken()) || ""}`,
          },
          body: JSON.stringify({ publicId: logoPublicId, documentId: id }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("[delete-brand] Cloudinary delete failed:", errData);
        }
      }
      await deleteDoc(doc(db, COLLECTIONS.clientBrands, id));
      setClientBrands((prev) => prev.filter((b) => b.id !== id));
      setBrandSuccess("Brand deleted successfully.");
      setTimeout(() => setBrandSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to delete brand", err);
      setBrandError(err instanceof Error ? err.message : "Failed to delete brand.");
    }
  };

  const handleToggleBrandStatus = async (brand: ClientBrand) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.clientBrands, brand.id), { isActive: !brand.isActive, updatedAt: serverTimestamp() });
      setClientBrands((prev) => prev.map((b) => (b.id === brand.id ? { ...b, isActive: !brand.isActive } : b)));
    } catch (err) {
      console.error("Failed to toggle brand status", err);
      setBrandError(err instanceof Error ? err.message : "Failed to update brand status.");
    }
  };

  const handleUploadBrandLogo = async (file: File): Promise<{ secure_url: string; public_id: string } | null> => {
    setBrandLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const user = auth.currentUser;
      const idToken = user ? await user.getIdToken() : null;
      const res = await fetch("/api/admin/upload-brand-image", {
        method: "POST",
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }
      const data = await res.json();
      return { secure_url: data.secure_url, public_id: data.public_id };
    } catch (err) {
      console.error("[brand-logo] Upload failed:", err);
      setBrandError(err instanceof Error ? err.message : "Failed to upload logo.");
      return null;
    } finally {
      setBrandLogoUploading(false);
    }
  };

  const handleSubmitBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandError(null);
    setBrandSuccess(null);

    if (!brandForm.name.trim()) {
      setBrandError("Brand name is required.");
      return;
    }

    let logoUrl = brandForm.logoUrl;
    let logoPublicId = brandEditing?.logoPublicId;

    if (brandLogoFile) {
      const uploadResult = await handleUploadBrandLogo(brandLogoFile);
      if (!uploadResult) return;
      logoUrl = uploadResult.secure_url;
      logoPublicId = uploadResult.public_id;
    }

    if (!logoUrl && !brandEditing) {
      setBrandError("Logo is required for new brands.");
      return;
    }

    setBrandSubmitting(true);
    try {
      if (brandEditing) {
        await updateDoc(doc(db, COLLECTIONS.clientBrands, brandEditing.id), {
          name: brandForm.name.trim(),
          logoUrl: logoUrl || "",
          logoPublicId,
          websiteUrl: brandForm.websiteUrl.trim() || null,
          isActive: brandForm.isActive,
          displayOrder: brandForm.displayOrder,
          updatedAt: serverTimestamp(),
        });
        setClientBrands((prev) =>
          prev.map((b) =>
            b.id === brandEditing.id
              ? { ...b, name: brandForm.name.trim(), logoUrl: logoUrl || "", logoPublicId, websiteUrl: brandForm.websiteUrl.trim() || undefined, isActive: brandForm.isActive, displayOrder: brandForm.displayOrder }
              : b
          )
        );
        setBrandSuccess("Brand updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.clientBrands), {
          name: brandForm.name.trim(),
          logoUrl: logoUrl || "",
          logoPublicId,
          websiteUrl: brandForm.websiteUrl.trim() || null,
          isActive: brandForm.isActive,
          displayOrder: brandForm.displayOrder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setClientBrands((prev) => [...prev, { id: docRef.id, name: brandForm.name.trim(), logoUrl: logoUrl || "", logoPublicId, websiteUrl: brandForm.websiteUrl.trim() || undefined, isActive: brandForm.isActive, displayOrder: brandForm.displayOrder, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
        setBrandSuccess("Brand added successfully!");
      }
      resetBrandForm();
      setTimeout(() => setBrandSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to save brand", err);
      setBrandError(err instanceof Error ? err.message : "Failed to save brand.");
    } finally {
      setBrandSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/corexit-admin-login");
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FB]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[18px] font-extrabold tracking-tight text-[#071A33]">COREX <span className="text-[#0057B8]">IT</span> <span className="ml-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400">Admin · corexit-652f5</span></span>
            <span className="hidden md:inline text-[12px] text-slate-500">{userEmail}</span>
          </div>
          <a href="/corexit-admin/projects" className="px-4 py-2 rounded-lg bg-[#0057B8] text-white text-[13px] font-semibold">Projects Management</a>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:bg-slate-50">Logout</button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-[220px] shrink-0">
          <nav className="bg-white border border-slate-200 rounded-[14px] p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "testimonials", label: "Testimonials" },
              { id: "messages", label: "Contact Messages" },
              { id: "images", label: "Website Images" },
              { id: "blogs", label: "Blog Management" },
              { id: "company-highlights", label: "Company Highlights" },
              { id: "client-brands", label: "Client Brands" },
              { id: "settings", label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as Tab)}
                className={`px-4 py-2.5 rounded-lg text-[13.5px] font-medium text-left whitespace-nowrap transition-colors ${tab === item.id ? "bg-[#071A33] text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 p-4 rounded-[14px] bg-white border border-slate-200">
            <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 font-semibold">Firebase</p>
            <p className="text-[12px] text-slate-600 mt-1">Project: corexit-652f5</p>
            <p className="text-[12px] text-slate-600">Auth: Email/Password</p>
            <p className="text-[11px] text-slate-400 mt-2">Collections: testimonials · contact_messages · settings · websiteImages · blogs · company_highlights · client_brands</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {loadingData ? (
            <div className="bg-white border border-slate-200 rounded-[16px] p-12 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
            </div>
          ) : tab === "dashboard" ? (
            <div className="space-y-6">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Dashboard</h1>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Total Testimonials", value: stats.totalTestimonials, sub: `${stats.published} published · ${stats.hidden} hidden · ${stats.pending} pending` },
                  { label: "Published Testimonials", value: stats.published, sub: "Visible on Home Page" },
                  { label: "Hidden Testimonials", value: stats.hidden, sub: "Not visible publicly" },
                  { label: "Pending Testimonials", value: stats.pending, sub: "Awaiting review (one-time link)" },
                  { label: "Total Contact Messages", value: stats.totalMessages, sub: `${stats.newMessages} new · ${stats.readMessages} read` },
                  { label: "New Messages", value: stats.newMessages, sub: "Require attention" },
                  { label: "Read Messages", value: stats.readMessages, sub: `${stats.repliedMessages} replied` },
                ].map((c) => (
                  <div key={c.label} className="bg-white border border-slate-200 rounded-[16px] p-5">
                    <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 font-semibold">{c.label}</p>
                    <p className="text-[28px] font-bold tracking-[-0.02em] text-[#071A33] mt-2">{c.value}</p>
                    <p className="text-[12px] text-slate-500 mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-[16px] p-6">
                  <h3 className="text-[14px] font-semibold text-[#071A33]">Recent Testimonials</h3>
                  <div className="mt-4 space-y-3">
                    {testimonials.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#071A33] truncate">{t.name} <span className="text-slate-400 font-normal">· {t.rating}★</span></p>
                          <p className="text-[11px] text-slate-500 truncate">{t.designation || t.company || "—"} · {t.status}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold tracking-[0.06em] uppercase ${t.status === "published" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : t.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{t.status}</span>
                      </div>
                    ))}
                    {testimonials.length === 0 && <p className="text-[13px] text-slate-400">No testimonials yet.</p>}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-[16px] p-6">
                  <h3 className="text-[14px] font-semibold text-[#071A33]">Recent Messages</h3>
                  <div className="mt-4 space-y-3">
                    {messages.slice(0, 5).map((m) => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-medium text-[#071A33] truncate">{m.fullName} <span className="text-slate-400 font-normal">· {m.subject}</span></p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${m.status === "new" ? "bg-blue-50 text-blue-700 border-blue-100" : m.status === "read" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>{m.status}</span>
                        </div>
                        <p className="text-[12px] text-slate-500 truncate mt-1">{m.message}</p>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-[13px] text-slate-400">No messages yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : tab === "testimonials" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Testimonials</h1>
                <span className="text-[12px] text-slate-500">{testimonials.length} total · {stats.pending} pending</span>
              </div>

              {/* One-time Customer Link Generator */}
              <div className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold tracking-[0.04em] uppercase text-slate-600">One-time Customer Link</h3>
                  <span className="text-[11px] text-slate-400">Single-use · Image upload NOT included for customer</span>
                </div>
                <p className="text-[12px] leading-[1.6] text-slate-500">Generate a single-use link to invite a customer to submit a testimonial. Customer form has NO image upload (name, company, position/role, testimonial, optional rating only). Submissions are created as <span className="font-semibold text-amber-700">pending</span> for you to review, publish, or add images via the admin form below.</p>
                <form onSubmit={handleGenerateInvite} className="grid sm:grid-cols-[1fr_140px_auto] gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Note (optional, for your reference)</label>
                    <input value={inviteNote} onChange={(e) => setInviteNote(e.target.value)} placeholder="e.g. Client: Acme Inc — project X" className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" maxLength={120} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Expiry</label>
                    <select value={inviteExpiryDays} onChange={(e) => setInviteExpiryDays(e.target.value)} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]">
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                  <button type="submit" disabled={generatingInvite} className="px-5 py-2.5 rounded-xl bg-[#071A33] text-white text-[13px] font-semibold hover:bg-black disabled:opacity-50 whitespace-nowrap">
                    {generatingInvite ? "Generating…" : "Generate Link"}
                  </button>
                </form>
                {inviteError && <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{inviteError}</p>}
                {generatedLink && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-emerald-700">Generated one-time link (copy now)</p>
                      <p className="text-[12px] font-mono text-emerald-800 break-all mt-1">{generatedLink}</p>
                      <p className="text-[11px] text-emerald-600 mt-1">Customer will submit without image upload. You can add image after they submit.</p>
                    </div>
                    <button onClick={() => handleCopyLink(generatedLink)} className="shrink-0 px-4 py-2 rounded-lg bg-[#0057B8] text-white text-[12px] font-medium hover:bg-[#003B7A]">{copiedLink === generatedLink ? "Copied!" : "Copy"}</button>
                  </div>
                )}
                {/* Invites list */}
                {invites.length > 0 && (
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500">Recent Invite Links ({invites.length})</p>
                      <span className="text-[11px] text-slate-400">One-time · used/expired are blocked</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[240px] overflow-auto">
                      {invites.slice(0, 20).map((inv) => {
                        // Secure: raw token never stored; only tokenHash is persisted. For new invites, link cannot be reconstructed from list.
                        // Legacy invites may have plain token in `token` field — support both.
                        const isLegacyRaw = !!(inv as unknown as { token?: string }).token && (inv as unknown as { token: string }).token.length >= 32 && (inv as unknown as { token: string }).token !== (inv as unknown as { tokenHash?: string }).tokenHash;
                        const displayToken = isLegacyRaw ? (inv as unknown as { token: string }).token : (inv as unknown as { tokenHash?: string }).tokenHash || inv.id;
                        const link = isLegacyRaw ? `${typeof window !== "undefined" ? window.location.origin : ""}/testimonial/${displayToken}` : `Invite ${displayToken.slice(0, 12)}… (raw link shown once at generation)`;
                        const status = (inv.status as string) || (inv.used ? "used" : "unused");
                        const isUsed = status === "used" || !!inv.used;
                        let isExpired = false;
                        if (inv.expiresAt) {
                          try {
                            let d: Date | null = null;
                            if (inv.expiresAt instanceof Timestamp) d = inv.expiresAt.toDate();
                            else if (typeof inv.expiresAt === "string") d = new Date(inv.expiresAt as string);
                            else d = new Date(inv.expiresAt as unknown as string);
                            if (d && !Number.isNaN(d.getTime()) && d.getTime() < Date.now()) isExpired = true;
                          } catch { /* ignore */ }
                        }
                        return (
                          <div key={inv.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-mono text-slate-700 truncate">{link}</p>
                              <p className="text-[11px] text-slate-400 truncate">{inv.note ? `${inv.note} · ` : ""}{formatDate(inv.createdAt)} {inv.expiresAt ? `· expires ${formatDate(inv.expiresAt)}` : ""}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${isUsed ? "bg-slate-100 text-slate-500 border-slate-200" : isExpired ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>{isUsed ? "Used" : isExpired ? "Expired" : "Active"}</span>
                              {isLegacyRaw && <button onClick={() => handleCopyLink(link)} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50">{copiedLink === link ? "Copied" : "Copy"}</button>}
                              <button onClick={() => handleDeleteInvite((inv as unknown as { tokenHash?: string }).tokenHash || inv.id)} className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-[11px] font-medium text-red-600 hover:bg-red-100">Delete</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {invites.length === 0 && <p className="text-[11px] text-slate-400">No invites generated yet. Links appear here after generation.</p>}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitTestimonial} className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#071A33]">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h3>
                  {editingId && (
                    <button type="button" onClick={resetTForm} className="text-[12px] font-medium text-slate-500 hover:text-[#071A33]">Cancel edit</button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Name *</label>
                    <input value={tForm.name} onChange={(e) => setTForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="Amal Perera" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Company</label>
                    <input value={tForm.company} onChange={(e) => setTForm((p) => ({ ...p, company: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="Nexus Analytics" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Designation</label>
                    <input value={tForm.designation} onChange={(e) => setTForm((p) => ({ ...p, designation: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="Operations Director" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Rating *</label>
                    <select value={tForm.rating} onChange={(e) => setTForm((p) => ({ ...p, rating: Number(e.target.value) }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Comment *</label>
                  <textarea value={tForm.comment} onChange={(e) => setTForm((p) => ({ ...p, comment: e.target.value }))} rows={3} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8] resize-none" placeholder="Client feedback..." maxLength={600} />
                  <p className="text-[11px] text-slate-400 mt-1">{tForm.comment.length}/600</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Status</label>
                    <select value={tForm.status} onChange={(e) => setTForm((p) => ({ ...p, status: e.target.value as "published" | "hidden" | "pending" }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]">
                      <option value="published">Published (visible on Home)</option>
                      <option value="hidden">Hidden</option>
                      <option value="pending">Pending (awaiting review)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Customer Image (Upload to Storage: testimonials/customer-images/)</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-[13px] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#0057B8] file:text-white file:text-[12px] file:font-medium hover:file:bg-[#003B7A]" />
                    {(tForm.imageUrl || imageFile) && (
                      <p className="text-[11px] text-slate-500 mt-1 truncate">{imageFile ? `Selected: ${imageFile.name}` : `Current: ${tForm.imageUrl.slice(0, 60)}...`}</p>
                    )}
                  </div>
                </div>
                {tError && <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{tError}</p>}
                <button type="submit" disabled={tSubmitting} className="px-6 py-3 rounded-none bg-[#0057B8] text-white text-[13px] font-semibold hover:bg-[#003B7A] disabled:opacity-50">
                  {tSubmitting ? "Saving…" : editingId ? "Update Testimonial" : "Add Testimonial"}
                </button>
                <p className="text-[11px] text-slate-400">Image will be uploaded to Firebase Storage (corexit-652f5) and URL saved in Firestore.</p>
              </form>

              {/* List */}
              <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold tracking-[0.04em] uppercase text-slate-600">All Testimonials</h3>
                  <span className="text-[11px] text-slate-400">Storage: testimonials/ · Fields: name, company, designation, comment, imageUrl, rating, status, createdAt</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {testimonials.map((t) => (
                    <div key={t.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
                      <img src={t.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=EAF4FF&color=0057B8`} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#071A33]">{t.name} <span className="text-slate-400 font-normal">· {t.rating}★ · {t.status}</span></p>
                        <p className="text-[12px] text-slate-500 truncate">{[t.designation, t.company].filter(Boolean).join(" · ")}</p>
                        <p className="text-[13px] text-slate-700 mt-1 line-clamp-2">&ldquo;{t.comment}&rdquo;</p>
                        <p className="text-[11px] text-slate-400 mt-1">{formatDate(t.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {t.status === "pending" && (
                          <button onClick={() => handlePublishPending(t)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                            Approve & Publish
                          </button>
                        )}
                        <button onClick={() => handleToggleStatus(t)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border ${t.status === "published" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : t.status === "pending" ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}>
                          {t.status === "published" ? "Hide" : t.status === "pending" ? "Publish" : "Publish"}
                        </button>
                        <button onClick={() => handleEdit(t)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                        <button onClick={() => handleDeleteTestimonial(t.id)} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[11px] font-medium text-red-600 hover:bg-red-100">Delete</button>
                      </div>
                    </div>
                  ))}
                  {testimonials.length === 0 && <p className="px-6 py-12 text-center text-[13px] text-slate-400">No testimonials yet. Add your first one above.</p>}
                </div>
              </div>
            </div>
          ) : tab === "company-highlights" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Company Highlights</h1>
                <span className="text-[12px] text-slate-500">Firestore · company_highlights/main</span>
              </div>

              {highlightLoading ? (
                <div className="bg-white border border-slate-200 rounded-[16px] p-12 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSaveHighlights} className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#071A33]">Company Statistics</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Shown on the Home page &ldquo;Company Highlights&rdquo; section (right-hand statistics). Saved to the same document the public site reads.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <HighlightField
                      label="Projects Completed"
                      value={highlightForm.projectsCompleted}
                      suffix={highlightForm.projectsSuffix}
                      onValue={(v) => setHighlightForm((p) => ({ ...p, projectsCompleted: v }))}
                      onSuffix={(s) => setHighlightForm((p) => ({ ...p, projectsSuffix: s }))}
                    />
                    <HighlightField
                      label="Happy Clients"
                      value={highlightForm.happyClients}
                      suffix={highlightForm.clientsSuffix}
                      onValue={(v) => setHighlightForm((p) => ({ ...p, happyClients: v }))}
                      onSuffix={(s) => setHighlightForm((p) => ({ ...p, clientsSuffix: s }))}
                    />
                    <HighlightField
                      label="Team Members / Employees"
                      value={highlightForm.teamMembers}
                      suffix={highlightForm.teamSuffix}
                      onValue={(v) => setHighlightForm((p) => ({ ...p, teamMembers: v }))}
                      onSuffix={(s) => setHighlightForm((p) => ({ ...p, teamSuffix: s }))}
                    />
                    <HighlightField
                      label="Years of Experience"
                      value={highlightForm.yearsExperience}
                      suffix={highlightForm.yearsSuffix}
                      onValue={(v) => setHighlightForm((p) => ({ ...p, yearsExperience: v }))}
                      onSuffix={(s) => setHighlightForm((p) => ({ ...p, yearsSuffix: s }))}
                    />
                  </div>

                  {highlightError && <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{highlightError}</p>}
                  {highlightSuccess && <p className="text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{highlightSuccess}</p>}

                  <div className="flex items-center gap-3">
                    <button type="submit" disabled={highlightSaving} className="px-6 py-3 rounded-none bg-[#0057B8] text-white text-[13px] font-semibold hover:bg-[#003B7A] disabled:opacity-50">
                      {highlightSaving ? "Saving…" : "Save Company Highlights"}
                    </button>
                    {highlightSaving && <span className="text-[12px] text-slate-500">Updating Firestore…</span>}
                  </div>
                </form>
              )}
            </div>
          ) : tab === "client-brands" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Client Brands</h1>
                <span className="text-[12px] text-slate-500">Firestore · client_brands collection</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitBrand} className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#071A33]">{brandEditing ? "Edit Brand" : "Add Brand"}</h3>
                  {brandEditing && (
                    <button type="button" onClick={resetBrandForm} className="text-[12px] font-medium text-slate-500 hover:text-[#071A33]">Cancel edit</button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Brand Name *</label>
                    <input
                      value={brandForm.name}
                      onChange={(e) => setBrandForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]"
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Display Order</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={brandForm.displayOrder}
                      onChange={(e) => setBrandForm((p) => ({ ...p, displayOrder: Number(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Website URL (optional)</label>
                    <input
                      type="url"
                      value={brandForm.websiteUrl}
                      onChange={(e) => setBrandForm((p) => ({ ...p, websiteUrl: e.target.value }))}
                      className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Logo *</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center w-28 h-28 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer overflow-hidden hover:border-[#0057B8] transition-colors"
                          onClick={() => document.getElementById("brand-logo-input")?.click()}
                        >
                          {brandLogoPreview ? (
                            <img src={brandLogoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </label>
                        <div className="flex-1">
                          <input
                            id="brand-logo-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 10 * 1024 * 1024) {
                                setBrandError("File too large. Max 10MB.");
                                return;
                              }
                              setBrandLogoFile(file);
                              setBrandError(null);
                              const previewUrl = URL.createObjectURL(file);
                              setBrandLogoPreview(previewUrl);
                              setBrandForm((p) => ({ ...p, logoUrl: previewUrl }));
                            }}
                            className="sr-only"
                          />
                          <div className="space-y-1">
                            <p className="text-[13px] font-medium text-slate-700">Click or drag to upload logo</p>
                            <p className="text-[11px] text-slate-500">JPG, PNG, WebP, GIF, AVIF · Max 10MB · Recommended: ~160×60px</p>
                          </div>
                        </div>
                      </div>
                      {brandLogoUploading && (
                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                          <div className="w-4 h-4 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
                          Uploading logo to Cloudinary…
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={brandForm.isActive}
                        onChange={(e) => setBrandForm((p) => ({ ...p, isActive: e.target.checked }))}
                        className="w-4 h-4 text-[#0057B8] border-slate-300 rounded focus:ring-[#0057B8]"
                      />
                      <span className="text-[13px] text-slate-700">Active (visible on Home page marquee)</span>
                    </label>
                  </div>
                </div>

                {brandError && <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{brandError}</p>}
                {brandSuccess && <p className="text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{brandSuccess}</p>}

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={brandSubmitting} className="px-6 py-3 rounded-none bg-[#0057B8] text-white text-[13px] font-semibold hover:bg-[#003B7A] disabled:opacity-50">
                    {brandSubmitting ? "Saving…" : brandEditing ? "Update Brand" : "Add Brand"}
                  </button>
                  {brandSubmitting && <span className="text-[12px] text-slate-500">Saving to Firestore…</span>}
                </div>
              </form>

              {/* Brand List */}
              {brandsLoading ? (
                <div className="bg-white border border-slate-200 rounded-[16px] p-12 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {clientBrands.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-[14px] text-slate-500">No brands yet. Add your first brand above.</p>
                      </div>
                    ) : (
                      clientBrands.map((brand) => (
                        <div key={brand.id} className="flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                          <div className="relative w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain p-2"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400">No logo</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] font-semibold text-[#071A33] truncate">{brand.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {brand.websiteUrl && (
                                <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#0057B8] hover:underline truncate max-w-[300px]">{brand.websiteUrl}</a>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${brand.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                {brand.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-[11px] text-slate-400">Order: {brand.displayOrder}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleBrandStatus(brand)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border ${brand.isActive ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
                            >
                              {brand.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button onClick={() => handleEditBrand(brand)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                            <button onClick={() => handleDeleteBrand(brand.id, brand.logoPublicId)} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[11px] font-medium text-red-600 hover:bg-red-100">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : tab === "messages" ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Contact Messages</h1>
                <span className="text-[12px] text-slate-500">{filteredMessages.length} / {messages.length}</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col sm:flex-row gap-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, subject, message…" className="flex-1 px-4 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} className="px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]">
                  <option value="all">All statuses</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>

              <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden divide-y divide-slate-100">
                {filteredMessages.map((m) => (
                  <div key={m.id} className="px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[13.5px] font-semibold text-[#071A33]">{m.fullName} <span className="text-slate-400 font-normal">· {m.email}</span></p>
                        <p className="text-[12px] text-slate-500 mt-0.5">{[m.phone, m.company].filter(Boolean).join(" · ") || "—"} · {m.subject} · {formatDate(m.createdAt)}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.06em] border ${m.status === "new" ? "bg-blue-50 text-blue-700 border-blue-200" : m.status === "read" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>{m.status}</span>
                    </div>
                    <p className="text-[13px] leading-[1.6] text-slate-700 mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">{m.message}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={() => handleUpdateMessageStatus(m.id, "read")} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50">Mark as Read</button>
                      <button onClick={() => handleUpdateMessageStatus(m.id, "replied")} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">Mark as Replied</button>
                      <button onClick={() => handleUpdateMessageStatus(m.id, "new")} className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-medium text-blue-700 hover:bg-blue-100">Mark as New</button>
                      <button onClick={() => handleDeleteMessage(m.id)} className="ml-auto px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[11px] font-medium text-red-600 hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                ))}
                {filteredMessages.length === 0 && <p className="px-6 py-12 text-center text-[13px] text-slate-400">No messages match your search/filter.</p>}
              </div>
            </div>
          ) : tab === "images" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Website Images</h1>
                <span className="text-[12px] text-slate-500">{imageStats.total} total · {imageStats.active} active</span>
              </div>

              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-[16px] p-5">
                  <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 font-semibold">Total Images</p>
                  <p className="text-[28px] font-bold tracking-[-0.02em] text-[#071A33] mt-2">{imageStats.total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-[16px] p-5">
                  <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 font-semibold">Active Images</p>
                  <p className="text-[28px] font-bold tracking-[-0.02em] text-emerald-600 mt-2">{imageStats.active}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-[16px] p-5">
                  <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 font-semibold">Inactive Images</p>
                  <p className="text-[28px] font-bold tracking-[-0.02em] text-slate-500 mt-2">{imageStats.total - imageStats.active}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-[16px] p-5">
                  <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400 font-semibold">Categories Used</p>
                  <p className="text-[28px] font-bold tracking-[-0.02em] text-[#0057B8] mt-2">{Object.keys(imageStats.byCategory).length}</p>
                </div>
              </div>

              {/* Notifications */}
              {imgError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600">{imgError}</div>
              )}
              {imgSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[12px] text-emerald-600">{imgSuccess}</div>
              )}

              {/* Upload / Edit Form */}
              <form onSubmit={imageEditing ? handleUpdateImageMeta : handleUploadImage} className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#071A33]">{imageEditing ? "Edit Image" : "Upload Image"}</h3>
                  {imageEditing && (
                    <button type="button" onClick={resetImgForm} className="text-[12px] font-medium text-slate-500 hover:text-[#071A33]">Cancel edit</button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Title *</label>
                    <input value={imgForm.title} onChange={(e) => setImgForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="Website Hero Image" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Category *</label>
                    <select value={imgForm.category} onChange={(e) => setImgForm((p) => ({ ...p, category: e.target.value as WebsiteImageCategory }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]">
                      <option value="hero">Hero</option>
                      <option value="about">About</option>
                      <option value="services">Services</option>
                      <option value="projects">Projects</option>
                      <option value="blogs">Blogs</option>
                      <option value="testimonials">Testimonials</option>
                      <option value="contact">Contact</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Alt Text</label>
                    <input value={imgForm.altText} onChange={(e) => setImgForm((p) => ({ ...p, altText: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="Describe the image" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Sort Order</label>
                    <input type="number" value={imgForm.sortOrder} onChange={(e) => setImgForm((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea value={imgForm.description} onChange={(e) => setImgForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8] resize-none" placeholder="Optional description" maxLength={300} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">{imageEditing ? "Replace Image (optional)" : "Image File *"}</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => setImgFile(e.target.files?.[0] || null)} className="w-full text-[13px] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#0057B8] file:text-white file:text-[12px] file:font-medium hover:file:bg-[#003B7A]" />
                    {imgFile && <p className="text-[11px] text-slate-500 mt-1 truncate">Selected: {imgFile.name}</p>}
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={imgForm.isActive} onChange={(e) => setImgForm((p) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-[#0057B8] focus:ring-[#0057B8]" />
                      <span className="text-[13px] text-slate-700">Active (visible on website)</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={imageUploading || (!imageEditing && !imgFile)} className="px-6 py-3 rounded-none bg-[#0057B8] text-white text-[13px] font-semibold hover:bg-[#003B7A] disabled:opacity-50">
                    {imageUploading ? "Processing…" : imageEditing ? "Update Metadata" : "Upload Image"}
                  </button>
                  {imageEditing && imgFile && (
                    <button type="button" onClick={handleReplaceImage} disabled={imageUploading} className="px-6 py-3 rounded-none bg-[#071A33] text-white text-[13px] font-semibold hover:bg-black disabled:opacity-50">
                      {imageUploading ? "Processing…" : "Replace Image"}
                    </button>
                  )}
                </div>
                {imageEditing && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
                    Editing: <span className="font-semibold">{imageEditing.title}</span> · {imageEditing.category} · Cloudinary: {imageEditing.publicId?.slice(0, 30)}…
                  </div>
                )}
                <p className="text-[11px] text-slate-400">Images are uploaded to Cloudinary and metadata is saved to Firestore (websiteImages collection).</p>
              </form>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {(["all", "hero", "about", "services", "projects", "blogs", "testimonials", "contact", "general"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setImageFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${imageFilter === cat ? "bg-[#071A33] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    {cat !== "all" && imageStats.byCategory[cat] ? (
                      <span className="ml-1.5 text-[10px] opacity-60">({imageStats.byCategory[cat]})</span>
                    ) : null}
                  </button>
                ))}
              </div>

              {/* Image Grid */}
              {filteredImages.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-[16px] p-12 text-center">
                  <p className="text-[14px] text-slate-500">{imageFilter === "all" ? "No images uploaded yet. Upload your first image above." : `No ${imageFilter} images found.`}</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredImages.map((img) => (
                    <div key={img.id} className="bg-white border border-slate-200 rounded-[16px] overflow-hidden hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all">
                      <div className="relative h-[200px] bg-slate-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.imageUrl}
                          alt={img.altText || img.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em] border ${img.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          {img.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[13px] font-semibold text-[#071A33] truncate">{img.title || "Untitled"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[10px] font-semibold tracking-[0.06em] uppercase text-[#0057B8]">{img.category}</span>
                          <span className="text-[11px] text-slate-400">Sort: {img.sortOrder}</span>
                        </div>
                        {img.description && <p className="text-[11px] text-slate-500 mt-2 truncate">{img.description}</p>}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                          <button onClick={() => handleEditImage(img)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                          <button onClick={() => handleToggleImageActive(img)} className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium ${img.isActive ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}>
                            {img.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => handleDeleteImage(img)} className="ml-auto px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[11px] font-medium text-red-600 hover:bg-red-100">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "blogs" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Blog Management</h1>
                <span className="text-[12px] text-slate-500">{blogs.length} article{blogs.length === 1 ? "" : "s"}</span>
              </div>

              {/* Notifications */}
              {bError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600">{bError}</div>
              )}
              {bSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[12px] text-emerald-600">{bSuccess}</div>
              )}

              {/* Add / Edit Form */}
              <form
                onSubmit={blogEditing ? handleUpdateBlog : handleAddBlog}
                className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#071A33]">{blogEditing ? "Edit Blog" : "Add Blog"}</h3>
                  {blogEditing && (
                    <button type="button" onClick={resetBlogForm} className="text-[12px] font-medium text-slate-500 hover:text-[#071A33]">Cancel edit</button>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Blog Title *</label>
                  <input value={bForm.title} onChange={(e) => setBForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="Article title" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Author Name</label>
                    <input value={bForm.authorName} onChange={(e) => setBForm((p) => ({ ...p, authorName: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="Corex IT Engineering" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Category</label>
                    <select value={bForm.category} onChange={(e) => setBForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]">
                      <option value="">Select a category…</option>
                      {BLOG_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Medium Article URL *</label>
                    <input value={bForm.mediumUrl} onChange={(e) => setBForm((p) => ({ ...p, mediumUrl: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="https://medium.com/..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                      Cover Image {!blogEditing && "*"}
                      {blogCoverUploading && <span className="ml-2 text-[#0057B8]">· Uploading…</span>}
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept={BLOG_COVER_ACCEPT}
                          onChange={handleBlogCoverSelect}
                          disabled={blogCoverUploading || blogSubmitting}
                          className="w-full text-[13px] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#0057B8] file:text-white file:text-[12px] file:font-medium hover:file:bg-[#003B7A] disabled:opacity-50"
                        />
                        {blogCoverUploading ? (
                          <p className="text-[11px] text-[#0057B8] mt-1">Uploading cover image to Cloudinary…</p>
                        ) : blogEditing && !bForm.coverImage ? (
                          <p className="text-[11px] text-amber-600 mt-1">No cover image set — upload one to replace it.</p>
                        ) : bForm.coverImage ? (
                          <p className="text-[11px] text-emerald-600 mt-1">Cover image ready.</p>
                        ) : (
                          <p className="text-[11px] text-slate-500 mt-1">{blogEditing ? "Select an image to replace the current cover." : "Select an image from your computer to upload."}</p>
                        )}
                      </div>
                      {bForm.coverImage && (
                        <div className="shrink-0 w-40 h-24 rounded-[10px] overflow-hidden border border-slate-200 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={bForm.coverImage} alt="Cover preview" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Short Description</label>
                    <textarea value={bForm.description} onChange={(e) => setBForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8] resize-none" placeholder="Brief summary shown on the blog card" maxLength={500} />
                  </div>
                </div>
                <button type="submit" disabled={blogSubmitting || blogCoverUploading} className="px-6 py-3 rounded-none bg-[#0057B8] text-white text-[13px] font-semibold hover:bg-[#003B7A] disabled:opacity-50">
                  {blogSubmitting || blogCoverUploading ? "Saving…" : blogEditing ? "Update Blog" : "Add Blog"}
                </button>
                <p className="text-[11px] text-slate-400">Cover images are uploaded to Cloudinary and the secure URL is stored on the blog. Blogs live in the Firestore blogs collection and are shown on the public Blogs page — visitors open the Medium link when they click a card.</p>
              </form>

              {/* Blog List */}
              {blogs.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-[16px] p-12 text-center">
                  <p className="text-[14px] text-slate-500">No blogs yet. Add your first blog above.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="flex items-start gap-4 p-5">
                        <div className="relative w-24 h-20 rounded-[10px] overflow-hidden bg-slate-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={blog.coverImage || ""} alt={blog.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#071A33] truncate">{blog.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {blog.authorName && <p className="text-[12px] text-slate-500">{blog.authorName}</p>}
                            {blog.category && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-[#0057B8]/10 text-[#0057B8] text-[10px] font-semibold tracking-wide">{blog.category}</span>
)}
                          </div>
                          {blog.description && <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{blog.description}</p>}
                          {blog.mediumUrl && (
                            <a href={blog.mediumUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] text-[#0057B8] mt-1 hover:underline truncate max-w-[500px]">{blog.mediumUrl}</a>
)}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleEditBlog(blog)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50">Edit</button>
                          <button onClick={() => handleDeleteBlog(blog)} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[11px] font-medium text-red-600 hover:bg-red-100">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33]">Settings</h1>
              <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-5">
                <p className="text-[12px] text-slate-500">Editable company information — stored in Firestore <span className="font-mono">settings/company</span>. Public site reads this document.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Company Email</label>
                    <input value={settings.email} onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Company Phone</label>
                    <input value={settings.phone} onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Company Address</label>
                    <input value={settings.address} onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">Facebook URL</label>
                    <input value={settings.facebook} onChange={(e) => setSettings((p) => ({ ...p, facebook: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">GitHub URL</label>
                    <input value={settings.github} onChange={(e) => setSettings((p) => ({ ...p, github: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">TikTok URL</label>
                    <input value={settings.tiktok} onChange={(e) => setSettings((p) => ({ ...p, tiktok: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1.5">LinkedIn URL</label>
                    <input value={settings.linkedin} onChange={(e) => setSettings((p) => ({ ...p, linkedin: e.target.value }))} className="w-full px-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0057B8]" />
                  </div>
                </div>
                <button type="submit" disabled={settingsSaving} className="px-6 py-3 rounded-none bg-[#071A33] text-white text-[13px] font-semibold hover:bg-black disabled:opacity-50">
                  {settingsSaving ? "Saving…" : "Save Settings"}
                </button>
              </form>

              <div className="bg-amber-50 border border-amber-100 rounded-[14px] p-4">
                <p className="text-[12px] font-semibold text-amber-800">Security note</p>
                <p className="text-[12px] text-amber-700 mt-1">Do NOT expose Firebase Admin SDK private keys in the frontend. All writes require Authentication. See firestore.rules and storage.rules for least-privilege rules.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
