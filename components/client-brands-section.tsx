"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { db } from "@/lib/firebase";
import { reportPublicFirestoreError } from "@/lib/firestore-errors";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS, type ClientBrand } from "@/lib/firestore-types";

interface BrandItem extends ClientBrand {
  displayLogoUrl: string;
}

// At or below this count of UNIQUE active brands, render a plain static row
// (each brand exactly once). Auto-scroll only kicks in above it.
const MARQUEE_THRESHOLD = 5;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Defensive dedupe: Firestore doc ID is the primary key; also drop second
// documents that carry the exact same brand name + logo URL.
function dedupeBrands(list: BrandItem[]): BrandItem[] {
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();
  const out: BrandItem[] = [];
  for (const brand of list) {
    if (seenIds.has(brand.id)) continue;
    const logo = brand.displayLogoUrl || "";
    const signature = `${brand.name.trim().toLowerCase()}::${logo}`;
    if (logo && seenSignatures.has(signature)) continue;
    seenIds.add(brand.id);
    if (logo) seenSignatures.add(signature);
    out.push(brand);
  }
  return out;
}

export function ClientBrandsSection() {
  const { ref } = useInView({ rootMargin: "0px 0px -100px 0px" });
  const prefersReducedMotion = usePrefersReducedMotion();
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copies, setCopies] = useState(2);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstHalfRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const brandsQuery = query(
      collection(db, COLLECTIONS.clientBrands),
      where("isActive", "==", true),
      orderBy("displayOrder", "asc")
    );

    const unsub = onSnapshot(
      brandsQuery,
      (snap) => {
        const fetched = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          displayLogoUrl: doc.data().logoUrl || "",
        })) as BrandItem[];
        setBrands(dedupeBrands(fetched));
        setLoading(false);
      },
      (err) => {
        reportPublicFirestoreError(`${COLLECTIONS.clientBrands} (isActive == true, displayOrder asc)`, "list", err);
        setBrands([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const enableMarquee = brands.length > MARQUEE_THRESHOLD;

  // Marquee only: render enough identical copies of the brand list so the
  // loop never exposes blank space. Not used in static mode.
  useIsomorphicLayoutEffect(() => {
    if (!enableMarquee) return;
    const measure = () => {
      const viewport = viewportRef.current;
      const half = firstHalfRef.current;
      if (!viewport || !half) return;
      const halfWidth = half.offsetWidth;
      if (halfWidth <= 0) return;
      const needed = Math.max(2, Math.ceil(viewport.offsetWidth / halfWidth) + 1);
      setCopies((prev) => (prev === needed ? prev : needed));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [brands, enableMarquee]);

  useEffect(() => {
    if (loading || brands.length === 0) return;
    if (brands.length <= MARQUEE_THRESHOLD) return;
    if (!trackRef.current || !firstHalfRef.current) return;

    let position = 0;
    let lastTime = 0;
    const speed = 0.5; // px per ~16.67ms frame — slow, professional pace

    const animate = (time: number) => {
      const delta = lastTime ? Math.min(time - lastTime, 100) : 0;
      lastTime = time;

      if (!pauseRef.current && !prefersReducedMotion) {
        position -= speed * (delta / 16.67);

        // Every copy is identical, so wrapping by exactly one copy's width
        // produces a seamless loop with no jump and no gap.
        const halfWidth = firstHalfRef.current?.offsetWidth ?? 0;
        if (halfWidth > 0 && -position >= halfWidth) {
          position += halfWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${position}px)`;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [loading, brands, prefersReducedMotion]);

  const handleMouseEnter = () => {
    pauseRef.current = true;
  };

  const handleMouseLeave = () => {
    pauseRef.current = false;
  };

  const renderBrandFigure = (brand: BrandItem, isDuplicate: boolean) => (
    <figure
      key={isDuplicate ? `dup-${brand.id}` : brand.id}
      className="shrink-0 w-[140px] h-[75px] md:w-[170px] md:h-[85px] flex items-center justify-center"
    >
      {brand.websiteUrl ? (
        <a
          href={brand.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={isDuplicate ? -1 : undefined}
          className="w-full h-full flex items-center justify-center rounded-lg"
          aria-label={`Visit ${brand.name} website`}
        >
          <img
            src={brand.displayLogoUrl}
            alt={brand.name}
            className="max-w-full max-h-full object-contain grayscale transition-all duration-300 hover:grayscale-0 hover:scale-105"
            loading="lazy"
            width={170}
            height={85}
          />
        </a>
      ) : (
        <img
          src={brand.displayLogoUrl}
          alt={brand.name}
          className="max-w-full max-h-full object-contain grayscale transition-all duration-300 hover:grayscale-0 hover:scale-105"
          loading="lazy"
          width={170}
          height={85}
        />
      )}
    </figure>
  );

  if (loading) {
    return (
      <section ref={ref} className="bg-white border-y border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 md:py-16">
          <div className="max-w-[720px] mb-10">
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#0057B8] mb-2">TRUSTED BY</p>
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#071A33]">
              Brands We&rsquo;ve Worked With
            </h2>
            <p className="text-[15px] leading-[1.7] text-slate-600 mt-3">
              Trusted by businesses and organizations to build reliable digital experiences.
            </p>
          </div>
          <div className="h-24 flex items-center gap-8 md:gap-12 lg:gap-20 overflow-hidden" role="img" aria-label="Client brands loading">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="shrink-0 w-[140px] h-[75px] md:w-[170px] md:h-[85px] bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!loading && brands.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref}
      className="bg-white border-y border-slate-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 md:py-16">
        <div className="max-w-[720px] mb-10">
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#0057B8] mb-2">TRUSTED BY</p>
          <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#071A33]">
            Brands We&rsquo;ve Worked With
          </h2>
          <p className="text-[15px] leading-[1.7] text-slate-600 mt-3">
            Trusted by businesses and organizations to build reliable digital experiences.
          </p>
        </div>

        {!enableMarquee ? (
          // 1–5 unique brands: every brand exactly once, no cloning, no scroll.
          <div
            className="flex items-center gap-8 md:gap-12 lg:gap-20 overflow-x-auto [scrollbar-width:none] [-webkit-scrollbar:hidden]"
            role="list"
            aria-label="Client brands"
          >
            {brands.map((brand) => renderBrandFigure(brand, false))}
          </div>
        ) : (
          // >5 unique brands: continuous seamless marquee.
          <div ref={viewportRef} className="relative overflow-hidden" role="list" aria-label="Client brands">
            <div
              className="absolute inset-0 bg-gradient-to-r from-white via-white/0 to-white pointer-events-none"
              style={{ maskImage: "linear-gradient(to right, black 20%, transparent 100%)" }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-l from-white via-white/0 to-white pointer-events-none"
              style={{ maskImage: "linear-gradient(to left, black 20%, transparent 100%)" }}
              aria-hidden="true"
            />

            <div
              ref={trackRef}
              className="flex min-w-max will-change-transform"
              role="none"
            >
              {Array.from({ length: copies }, (_, copyIndex) => {
                const isDuplicate = copyIndex > 0;
                return (
                  <div
                    key={copyIndex}
                    ref={copyIndex === 0 ? firstHalfRef : undefined}
                    className="flex shrink-0 gap-8 md:gap-12 lg:gap-20 pr-8 md:pr-12 lg:pr-20"
                    role="listitem"
                    aria-hidden={isDuplicate || undefined}
                  >
                    {brands.map((brand) => renderBrandFigure(brand, isDuplicate))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
