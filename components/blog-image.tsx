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

export function useBlogImage(slug: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchImage() {
      try {
        const q = query(
          collection(db, COLLECTIONS.websiteImages),
          where("category", "==", "blogs"),
          where("isActive", "==", true)
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          const match = snap.docs.find((d) => {
            const data = d.data() as Omit<WebsiteImage, "id">;
            return data.title?.toLowerCase().includes(slug.toLowerCase()) ||
              data.description?.toLowerCase().includes(slug.toLowerCase());
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

export function BlogImage({
  slug,
  src,
  alt,
  className,
}: {
  slug: string;
  src: string;
  alt: string;
  className?: string;
}) {
  const { imageUrl } = useBlogImage(slug);
  const [imgError, setImgError] = useState(false);
  const finalSrc = imgError ? src : (imageUrl || src);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
}
