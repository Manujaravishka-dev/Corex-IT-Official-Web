"use client";

import { useEffect, useState } from "react";

type InviteStatus = "loading" | "valid" | "invalid" | "used" | "expired" | "error";

export default function CustomerTestimonialPage({ params }: { params: Promise<{ token: string }> | { token: string } }) {
  const [token, setToken] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("loading");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields - MUST NOT include image/file upload
  const [form, setForm] = useState({
    name: "",
    company: "",
    designation: "",
    comment: "",
    rating: 0, // optional; 0 = not selected
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  // Resolve params (Next 15 may pass Promise)
  useEffect(() => {
    if (params && typeof (params as Promise<{ token: string }>).then === "function") {
      (params as Promise<{ token: string }>).then((p) => setToken(p.token));
    } else {
      setToken((params as { token: string }).token);
    }
  }, [params]);

  // Validate invite via secure server API (not direct Firestore)
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function checkInvite() {
      setInviteStatus("loading");
      try {
        const res = await fetch(`/api/testimonial-invites/validate?token=${encodeURIComponent(token as string)}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.valid) {
          setInviteStatus("valid");
        } else {
          const reason = (data.reason as string) || "";
          if (reason === "used") setInviteStatus("used");
          else if (reason === "expired") setInviteStatus("expired");
          else if (res.status === 410) {
            // used or expired per spec message
            const msg = (data.message as string) || "";
            if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("used")) {
              // Use generic expired/used message; per spec show same
              setInviteStatus("used");
            } else setInviteStatus("expired");
          } else if (res.status === 404) setInviteStatus("invalid");
          else if (reason === "invalid") setInviteStatus("invalid");
          else setInviteStatus("invalid");
        }
      } catch (e) {
        console.error("Failed to validate invite", e);
        if (!cancelled) setInviteStatus("error");
      }
    }
    checkInvite();
    return () => { cancelled = true; };
  }, [token]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    else if (form.name.trim().length > 80) e.name = "Name must be under 80 characters";
    if (form.company && form.company.trim().length > 100) e.company = "Company must be under 100 characters";
    if (form.designation && form.designation.trim().length > 100) e.designation = "Position / Role must be under 100 characters";
    if (!form.comment.trim()) e.comment = "Testimonial is required";
    else if (form.comment.trim().length < 10) e.comment = "Testimonial must be at least 10 characters";
    else if (form.comment.trim().length > 600) e.comment = "Testimonial must be under 600 characters";
    if (form.rating !== 0 && (form.rating < 1 || form.rating > 5)) e.rating = "Rating must be between 1 and 5";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (inviteStatus !== "valid") return;
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: form.name.trim(),
          company: form.company.trim(),
          designation: form.designation.trim(),
          comment: form.comment.trim(),
          rating: form.rating, // 0 means optional -> server defaults to 5
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) {
          setFieldErrors((prev) => ({ ...prev, ...data.errors }));
          setError("Please correct the highlighted fields.");
        } else {
          const msg = (data.error as string) || "Failed to submit testimonial. Please try again.";
          setError(msg);
          // If server says used/expired, update UI to reflect
          if (res.status === 410) setInviteStatus("used");
          if (res.status === 404) setInviteStatus("invalid");
        }
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit testimonial", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (inviteStatus === "loading" || token === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FB] px-6 py-12">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
      </div>
    );
  }

  if (inviteStatus === "invalid") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FB] px-6 py-12">
        <div className="max-w-[560px] w-full bg-white border border-slate-200 rounded-[16px] p-8 text-center">
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#071A33]">Invalid link</h1>
          <p className="text-[13.5px] leading-[1.6] text-slate-500 mt-2">This testimonial link is invalid or does not exist. Please request a new link from Corex IT.</p>
        </div>
      </div>
    );
  }
  if (inviteStatus === "used" || inviteStatus === "expired") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FB] px-6 py-12">
        <div className="max-w-[560px] w-full bg-white border border-slate-200 rounded-[16px] p-8 text-center">
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#071A33]">This testimonial link has expired or has already been used.</h1>
          <p className="text-[13.5px] leading-[1.6] text-slate-500 mt-2">This one-time link has already been used or has expired. Please request a new link from Corex IT.</p>
          <p className="text-[12px] text-slate-400 mt-4">If you need to update your testimonial, please contact our team.</p>
        </div>
      </div>
    );
  }
  if (inviteStatus === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FB] px-6 py-12">
        <div className="max-w-[560px] w-full bg-white border border-amber-200 rounded-[16px] p-8 text-center bg-amber-50">
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-amber-800">Unable to verify link</h1>
          <p className="text-[13.5px] leading-[1.6] text-amber-700 mt-2">We could not verify this link. Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FB] px-6 py-12">
        <div className="max-w-[560px] w-full bg-white border border-slate-200 rounded-[16px] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8"><path d="M5 12l5 5l10 -10" /></svg>
          </div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#071A33] mt-4">Thank you for your feedback!</h1>
          <p className="text-[13.5px] leading-[1.6] text-slate-500 mt-2 max-w-[420px] mx-auto">Your testimonial has been submitted successfully. It is now pending review and will appear after approval by our team.</p>
          <p className="text-[12px] text-slate-400 mt-4">This link can no longer be used.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-[#F8F9FB] px-6 py-10 md:py-12">
      <div className="max-w-[640px] mx-auto">
        <div className="bg-white border border-slate-200 rounded-[16px] p-6 md:p-8">
          <div className="mb-6">
            <p className="text-[11px] tracking-[0.1em] uppercase font-semibold text-[#0057B8]">Corex IT</p>
            <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33] mt-1">Share your experience</h1>
            <p className="text-[13.5px] leading-[1.6] text-slate-500 mt-2">We appreciate your feedback. Please fill in your testimonial details below. Your submission will be reviewed before publishing.</p>
            <p className="text-[11px] text-slate-400 mt-2">One-time link · Single submission only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Customer name <span className="text-[#0057B8]">*</span></label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
                autoComplete="name"
              />
              {fieldErrors.name && <p className="text-[11px] text-red-500 mt-1.5">{fieldErrors.name}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Company <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  placeholder="Acme Inc."
                  className="w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
                />
                {fieldErrors.company && <p className="text-[11px] text-red-500 mt-1.5">{fieldErrors.company}</p>}
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Position / Role <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  value={form.designation}
                  onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                  placeholder="Product Manager"
                  className="w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
                />
                {fieldErrors.designation && <p className="text-[11px] text-red-500 mt-1.5">{fieldErrors.designation}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Testimonial / Comment <span className="text-[#0057B8]">*</span></label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                rows={5}
                placeholder="Tell us about your experience working with Corex IT..."
                className="w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF] resize-none"
                maxLength={600}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span>{fieldErrors.comment && <span className="text-[11px] text-red-500">{fieldErrors.comment}</span>}</span>
                <span className="text-[11px] text-slate-400">{form.comment.length}/600</span>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-2">Rating <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = form.rating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, rating: p.rating === n ? 0 : n }))}
                      aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${active ? "bg-[#0057B8] border-[#0057B8] text-white" : "bg-slate-50 border-slate-200 text-slate-300 hover:border-[#D4E8FF] hover:text-amber-400"}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </button>
                  );
                })}
                <span className="text-[12px] text-slate-500 ml-2">{form.rating ? `${form.rating} / 5` : "No rating selected"}</span>
                {form.rating !== 0 && (
                  <button type="button" onClick={() => setForm((p) => ({ ...p, rating: 0 }))} className="ml-2 text-[11px] text-slate-400 hover:text-slate-600 underline">Clear</button>
                )}
              </div>
              {fieldErrors.rating && <p className="text-[11px] text-red-500 mt-1.5">{fieldErrors.rating}</p>}
              <p className="text-[11px] text-slate-400 mt-1.5">Tap a star to select. Rating is optional.</p>
            </div>

            {/* NOTE: No image/file upload field per requirement. Customer MUST NOT have image upload. */}

            {error && <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0057B8] text-white text-[14px] font-semibold hover:bg-[#003B7A] transition-colors shadow-[0_10px_28px_rgba(0,87,184,0.18)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit testimonial"}
            </button>
            <p className="text-center text-[11px] text-slate-400">By submitting, you agree to our terms. Your testimonial will be reviewed before publishing.</p>
          </form>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-4">Protected one-time link · Corex IT</p>
      </div>
    </div>
  );
}
