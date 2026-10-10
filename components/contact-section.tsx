"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, SETTINGS_DOC_ID, type CompanySettings } from "@/lib/firestore-types";
import { defaultCompanySettings } from "@/lib/site-settings";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
}

export function ContactSection() {
  const { ref: sectionRef, isInView } = useInView();
  const [companyInfo, setCompanyInfo] = useState<CompanySettings>(defaultCompanySettings);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.settings, SETTINGS_DOC_ID));
        if (!cancelled && snap.exists()) setCompanyInfo({ ...defaultCompanySettings, ...(snap.data() as CompanySettings) } as CompanySettings);
      } catch (err) {
        console.error("Failed to load company settings", err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2) newErrors.fullName = "Name must be at least 2 characters";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (formData.phone && formData.phone.trim().length < 7) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (formData.company && formData.company.length > 100) {
      newErrors.company = "Company must be under 100 characters";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
<<<<<<< HEAD
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setSubmitError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitError("Network error. Please try again.");
=======
      await addDoc(collection(db, COLLECTIONS.contactMessages), {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setFormData({ fullName: "", email: "", phone: "", company: "", subject: "", message: "" });
    } catch (err: unknown) {
      console.error("Failed to submit contact message", err);
      const msg = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      // Common cause: firestore.rules must allow create on contact_messages for unauthenticated users
      setSubmitError(msg);
>>>>>>> 2c025544e1f15a8d71a440e0c31624deb1a31c5f
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const inputClass =
    "w-full px-4 py-3.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF] transition-colors duration-300";

  return (
    <section id="contact" className="py-16 md:py-20 bg-white border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div ref={sectionRef} className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#071A33] mb-8"
            >
              Have an idea
              <br />
              <span className="font-light">worth building?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[15px] leading-[1.7] text-slate-600 max-w-md mb-12"
            >
              Let&apos;s turn your idea into a digital product. Get in touch and
              let&apos;s discuss how Corex IT can bring your vision to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] border border-[#D4E8FF] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#0057B8]" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-[12px] text-slate-400 mb-0.5">Email</p>
                  <p className="text-[14px] text-slate-700 font-medium">{companyInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] border border-[#D4E8FF] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#0057B8]" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-[12px] text-slate-400 mb-0.5">Location</p>
                  <p className="text-[14px] text-slate-700 font-medium">{companyInfo.address}</p>
                  {companyInfo.phone && <p className="text-[12px] text-slate-500">{companyInfo.phone}</p>}
                </div>
              </div>

              <a
                href={`mailto:${companyInfo.email}`}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#071A33] hover:text-[#0057B8] transition-colors duration-300 mt-4 group"
              >
                Start a conversation
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.7} />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {submitted ? (
              <div className="h-full flex items-center justify-center p-12 rounded-2xl bg-[#F8F8F8] border border-[#E5E7EB]">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#D4E8FF] flex items-center justify-center mx-auto mb-5">
                    <svg className="w-5 h-5 text-[#071A33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] font-bold tracking-[-0.01em] text-[#071A33] mb-2">Message Sent</h3>
                  <p className="text-[14px] text-slate-500">
                    Thank you for reaching out. We&apos;ll respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-[13px] font-semibold text-[#0057B8] hover:text-[#003B7A]"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
<<<<<<< HEAD
              <>
                {submitError && (
                  <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px]">
                    {submitError}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={inputClass}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-red-500 text-[11px] mt-1.5">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={inputClass}
                        placeholder="you@company.com"
                      />
                      {errors.email && <p className="text-red-500 text-[11px] mt-1.5">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className={inputClass}
                      placeholder="Project inquiry"
                    />
                    {errors.subject && <p className="text-red-500 text-[11px] mt-1.5">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      rows={5}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us about your project..."
=======
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={inputClass}
                      placeholder="Your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-[11px] mt-1.5">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={inputClass}
                      placeholder="you@company.com"
>>>>>>> 2c025544e1f15a8d71a440e0c31624deb1a31c5f
                    />
                    {errors.message && <p className="text-red-500 text-[11px] mt-1.5">{errors.message}</p>}
                  </div>
<<<<<<< HEAD
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 text-[13px] font-semibold tracking-[0.02em] bg-[#0057B8] text-white rounded-none transition-all duration-300 hover:bg-[#003B7A] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
=======
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={inputClass}
                      placeholder="+94 7X XXX XXXX"
                    />
                    {errors.phone && <p className="text-red-500 text-[11px] mt-1.5">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className={inputClass}
                      placeholder="Your company"
                    />
                    {errors.company && <p className="text-red-500 text-[11px] mt-1.5">{errors.company}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className={inputClass}
                    placeholder="Project inquiry"
                  />
                  {errors.subject && <p className="text-red-500 text-[11px] mt-1.5">{errors.subject}</p>}
                </div>
                <div>
                  <label className="block text-[12px] text-slate-500 mb-2 tracking-[0.05em]">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={5}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us about your project..."
                  />
                  {errors.message && <p className="text-red-500 text-[11px] mt-1.5">{errors.message}</p>}
                </div>
                {submitError && (
                  <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 text-[13px] font-semibold tracking-[0.02em] bg-[#0057B8] text-white rounded-none transition-all duration-300 hover:bg-[#003B7A] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
                <p className="text-[11px] text-slate-400">Stored securely in Firestore · contact_messages · Admin will review shortly.</p>
              </form>
>>>>>>> 2c025544e1f15a8d71a440e0c31624deb1a31c5f
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
