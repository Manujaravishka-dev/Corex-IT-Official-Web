"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { db } from "@/lib/firebase";
import { reportPublicFirestoreError } from "@/lib/firestore-errors";
import { doc, onSnapshot } from "firebase/firestore";
import {
  COLLECTIONS,
  COMPANY_HIGHLIGHTS_DOC_ID,
  DEFAULT_COMPANY_HIGHLIGHTS,
} from "@/lib/firestore-types";

interface StatDefinition {
  key: string;
  label: string;
  valueField: keyof typeof DEFAULT_COMPANY_HIGHLIGHTS;
  suffixField: keyof typeof DEFAULT_COMPANY_HIGHLIGHTS;
  fallbackValue: number;
  fallbackSuffix: string;
  description: string;
}

const STAT_DEFINITIONS: StatDefinition[] = [
  {
    key: "projects",
    label: "Projects Completed",
    valueField: "projectsCompleted",
    suffixField: "projectsSuffix",
    fallbackValue: DEFAULT_COMPANY_HIGHLIGHTS.projectsCompleted,
    fallbackSuffix: DEFAULT_COMPANY_HIGHLIGHTS.projectsSuffix,
    description: "Successful projects delivered across industries",
  },
  {
    key: "clients",
    label: "Happy Clients",
    valueField: "happyClients",
    suffixField: "clientsSuffix",
    fallbackValue: DEFAULT_COMPANY_HIGHLIGHTS.happyClients,
    fallbackSuffix: DEFAULT_COMPANY_HIGHLIGHTS.clientsSuffix,
    description: "Businesses that trust our engineering",
  },
  {
    key: "team",
    label: "Team Members",
    valueField: "teamMembers",
    suffixField: "teamSuffix",
    fallbackValue: DEFAULT_COMPANY_HIGHLIGHTS.teamMembers,
    fallbackSuffix: DEFAULT_COMPANY_HIGHLIGHTS.teamSuffix,
    description: "Skilled engineers, designers & strategists",
  },
  {
    key: "years",
    label: "Years of Experience",
    valueField: "yearsExperience",
    suffixField: "yearsSuffix",
    fallbackValue: DEFAULT_COMPANY_HIGHLIGHTS.yearsExperience,
    fallbackSuffix: DEFAULT_COMPANY_HIGHLIGHTS.yearsSuffix,
    description: "Building reliable digital software",
  },
];

interface ResolvedStat {
  key: string;
  label: string;
  value: number;
  suffix: string;
  description: string;
}

function resolveStats(data?: Record<string, unknown>): ResolvedStat[] {
  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;
  const str = (v: unknown, fallback: string) =>
    typeof v === "string" && v.trim() !== "" ? v : fallback;

  return STAT_DEFINITIONS.map((def) => ({
    key: def.key,
    label: def.label,
    description: def.description,
    value: num(data?.[def.valueField], def.fallbackValue),
    suffix: str(data?.[def.suffixField], def.fallbackSuffix),
  }));
}

export function CompanyHighlightsSection() {
  const { ref, isInView } = useInView();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [stats, setStats] = useState<ResolvedStat[]>(() => resolveStats());
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState<number[]>(() => stats.map(() => 0));
  const displayRef = useRef<number[]>(display);
  const rafRef = useRef<number | null>(null);
  const cancelRef = useRef(false);

  // Subscribe to the company_highlights/main document in real time.
  // Falls back to the default sample values when the document is missing or unreadable.
  useEffect(() => {
    const statsDoc = doc(db, COLLECTIONS.companyHighlights, COMPANY_HIGHLIGHTS_DOC_ID);
    const unsub = onSnapshot(
      statsDoc,
      (snap) => {
        setStats(resolveStats(snap.exists() ? snap.data() : undefined));
        setLoading(false);
      },
      (err) => {
        reportPublicFirestoreError(`${COLLECTIONS.companyHighlights}/${COMPANY_HIGHLIGHTS_DOC_ID}`, "get", err);
        setStats(resolveStats());
        setLoading(false);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  // Clean up any running animation on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Count-up animation when the section becomes visible, or whenever the values update.
  useEffect(() => {
    if (loading) return;
    const targets = stats.map((s) => s.value);

    const commit = (values: number[]) => {
      displayRef.current = values;
      setDisplay(values);
    };

    // Reduced-motion users get final values immediately, no animation.
    if (prefersReducedMotion || stats.length === 0) {
      commit(targets);
      return;
    }

    // Don't animate while out of view; the display simply stays at zero until the
    // section scrolls into view, then the count-up runs once from the current values.
    if (!isInView) return;

    cancelRef.current = false;
    const from = [...displayRef.current];
    const startTime = Date.now();
    const duration = 1200;

    const step = () => {
      if (cancelRef.current) return;
      const t = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      commit(targets.map((target, i) => Math.round(from[i] + (target - from[i]) * eased)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        commit([...targets]);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stats, isInView, prefersReducedMotion, loading]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#040E1F]"
    >
      {/* Match the homepage hero: image-free angular navy-to-cyan gradient. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-r from-[#092C68] via-[#07569D] to-[#08A6E8]">
        <div className="absolute -left-[12%] top-[-50%] h-[125%] w-[76%] rotate-[32deg] bg-[#092452]/25" />
        <div className="absolute left-[25%] top-[-75%] h-[150%] w-[58%] rotate-[38deg] bg-[#2D9BD2]/20" />
        <div className="absolute -bottom-[75%] left-[20%] h-[120%] w-[80%] -rotate-[30deg] bg-[#003E86]/20" />
        <div className="absolute right-[-15%] top-[-30%] h-[95%] w-[35%] rotate-[35deg] border border-white/10" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-20 md:py-24">
        {/* Two-column layout */}
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16 items-start">
          {/* Left side: text content */}
          <div className="w-full lg:w-1/2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] backdrop-blur border border-white/10 text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8AB6FF] mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              COMPANY HIGHLIGHTS
            </span>

            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white mb-6">
              We Build Lasting Partnerships With Our Clients
            </h2>

            <p className="text-[15px] leading-[1.7] text-white/85 mb-8 max-w-lg">
              We create reliable digital solutions that help businesses grow, streamline operations and build stronger connections with their customers.
            </p>
          </div>

          {/* Right side: statistics grid */}
          <div className="w-full lg:w-1/2">
            {/* Blue divider above stats */}
            <div className="hidden"></div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Skeleton states while loading */}
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 py-4 border-y border-white/10"
                  >
                    <span className="inline-block h-10 w-24 rounded-lg bg-white/10 animate-pulse" />
                    <span className="inline-block h-3 w-28 rounded bg-white/10 animate-pulse" />
                    <span className="inline-block h-3 w-20 rounded bg-white/10 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div
                    key={stat.key}
                    className="flex flex-col items-center gap-2 py-4 border-y border-white/10"
                  >
                    <span
                      className="text-[3rem] font-bold text-white tracking-[-0.02em]"
                    >
                      {display[i]}{stat.suffix}
                    </span>

                    <p className="text-[12px] font-medium text-blue-100 uppercase tracking-[0.1em]">
                      {stat.label}
                    </p>

                    <p className="text-[11px] text-blue-100/80 text-center">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}