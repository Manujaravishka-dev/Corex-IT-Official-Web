"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type WebsiteImage } from "@/lib/firestore-types";

export function useProjectImage(slug: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchImage() {
      try {
        const q = query(
          collection(db, COLLECTIONS.websiteImages),
          where("category", "==", "projects"),
          where("isActive", "==", true)
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          const match = snap.docs.find((d) => {
            const data = d.data() as Omit<WebsiteImage, "id">;
            return data.title?.toLowerCase().includes(slug.toLowerCase());
          });
          if (match) {
            setImageUrl((match.data() as Omit<WebsiteImage, "id">).imageUrl);
          }
        }
      } catch {
        // silently fall back
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchImage();
    return () => { cancelled = true; };
  }, [slug]);

  return { imageUrl, loading };
}

export function ProjectImage({
  slug,
  alt,
  className,
}: {
  slug: string;
  alt: string;
  className?: string;
}) {
  const { imageUrl } = useProjectImage(slug);
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${className || ""} bg-[#EAF4FF] flex items-center justify-center`}>
      <span className="text-[13px] font-extrabold tracking-[-0.02em] text-[#7B93B5]">
        COREX <span className="text-[#0057B8]">IT</span>
      </span>
    </div>
  );
}
