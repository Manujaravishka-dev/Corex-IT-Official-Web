"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { Star, Quote, Award, User } from "lucide-react";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { reportPublicFirestoreError } from "@/lib/firestore-errors";
import { COLLECTIONS, type Testimonial } from "@/lib/firestore-types";

function CustomerAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const [hasError, setHasError] = useState(false);
  const showImage = !!imageUrl && !hasError;
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4E8FF] bg-[#EAF4FF] shrink-0 relative flex items-center justify-center">
      {showImage ? (
        <Image
          src={imageUrl as string}
          alt={`${name} — customer photo`}
          fill
          sizes="40px"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <User className="w-5 h-5 text-[#0057B8]/60" strokeWidth={1.7} />
      )}
    </div>
  );
}

function formatDate(value: Timestamp | Date | string | undefined): string {
  try {
    let d: Date;
    if (!value) return "";
    if (value instanceof Timestamp) d = value.toDate();
    else if (value instanceof Date) d = value;
    else d = new Date(value);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
          strokeWidth={1.6}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const { ref, isInView } = useInView({ threshold: 0.12 });
  const { ref: gridRef, isInView: gridInView } = useInView({ threshold: 0.08 });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchTestimonials() {
      try {
        const q = query(
          collection(db, COLLECTIONS.testimonials),
          where("status", "==", "published"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          const items: Testimonial[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Testimonial, "id">),
          }));
          setTestimonials(items);
        }
      } catch (err) {
        reportPublicFirestoreError(`${COLLECTIONS.testimonials} (status == published)`, "list", err);
        // Hint: firestore.rules must allow public read where status=="published" (see firestore.rules)
        // Check that collection is 'testimonials' and docs have status="published"
        if (!cancelled) setTestimonials([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTestimonials();
    return () => {
      cancelled = true;
    };
  }, []);

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, r) => s + r.rating, 0) / testimonials.length).toFixed(1)
    : "5.0";

  return (
    <section id="testimonials" className="relative bg-[#F8F8F8] overflow-hidden border-t border-slate-100">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#071A33_1px,transparent_1px),linear-gradient(to_bottom,#071A33_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div ref={ref} className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-16 md:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-[clamp(1.85rem,3.4vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#071A33]">
              Trusted by teams who
              <br />
              <span className="font-light">build with us.</span>
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="max-w-[520px] text-[14.5px] leading-[1.7] text-slate-600 lg:ml-auto">
              Real feedback from founders, product leaders and engineering teams who ship with Corex IT.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 mb-8 p-4 rounded-[14px] bg-white border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#071A33] flex items-center justify-center text-white">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold tracking-[-0.02em] text-[#071A33]">{avgRating}</span>
                <Stars rating={Math.round(Number(avgRating))} />
                <span className="text-[12px] text-slate-500">· {testimonials.length} reviews</span>
              </div>
              <p className="text-[11px] tracking-[0.06em] uppercase text-slate-400 font-medium">Average client rating</p>
            </div>
          </div>
          <span className="hidden sm:block w-px h-10 bg-slate-200" />
          <div className="flex items-center gap-2 text-[12px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Verified feedback · Colombo · Remote collaborations
          </div>
          <span className="ml-auto hidden lg:inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-slate-400">
            <span className="w-6 h-px bg-slate-200" />
            High-end enterprise partner
          </span>
        </motion.div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[16px] bg-white border border-slate-200 p-6 animate-pulse">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <div key={j} className="w-3.5 h-3.5 rounded bg-slate-100" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                    <div className="h-2 w-32 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : testimonials.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-[16px] bg-white border border-dashed border-slate-200">
              <p className="text-[14px] text-slate-500">No testimonials published yet. Check back soon.</p>
            </div>
          ) : (
            testimonials.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                animate={gridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col rounded-[16px] bg-white border border-slate-200 p-6 hover:border-[#0057B8]/20 hover:shadow-[0_8px_24px_rgba(0,87,184,0.08)] hover:-translate-y-[1px] transition-all duration-300"
              >
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F8F8F8] border border-slate-100 flex items-center justify-center group-hover:bg-[#EAF4FF] group-hover:border-[#D4E8FF] transition-colors">
                  <Quote className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0057B8] transition-colors" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Stars rating={r.rating} />
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500 ml-1">{r.rating}.0</span>
                  <span className="text-[11px] text-slate-300">·</span>
                  <span className="text-[11px] text-slate-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-[14px] leading-[1.7] text-slate-700 mt-4 flex-1">&ldquo;{r.comment}&rdquo;</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                  <CustomerAvatar name={r.name} imageUrl={r.imageUrl} />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold tracking-[-0.01em] text-[#071A33] truncate">{r.name}</p>
                    {(r.company || r.designation) && (
                      <p className="text-[11.5px] leading-[1.4] text-slate-500 truncate">
                        {[r.designation, r.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                <span className="absolute bottom-0 left-6 right-6 h-px bg-[#0057B8] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={gridInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/60"
        >
          <p className="text-[12.5px] leading-[1.6] text-slate-500 text-center sm:text-left">
            We publish only verified client feedback — managed securely via Firebase.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
