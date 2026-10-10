"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type WebsiteImage, type WebsiteImageCategory } from "@/lib/firestore-types";

export type { WebsiteImage, WebsiteImageCategory };

export function useWebsiteImages(category: WebsiteImageCategory) {
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchImages() {
      try {
        const q = query(
          collection(db, COLLECTIONS.websiteImages),
          where("category", "==", category),
          where("isActive", "==", true),
          orderBy("sortOrder", "asc")
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          setImages(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WebsiteImage, "id">) }))
          );
        }
      } catch (err) {
        console.warn(`Website images unavailable for "${category}" — using fallback images.`, err);
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchImages();
    return () => { cancelled = true; };
  }, [category]);

  return { images, loading };
}

export function toSlideImages(websiteImages: WebsiteImage[]): { src: string; alt: string; pos: string }[] {
  if (websiteImages.length === 0) return [];
  return websiteImages.map((img) => ({
    src: img.imageUrl,
    alt: img.altText || img.title,
    pos: "object-[center_40%]",
  }));
}
