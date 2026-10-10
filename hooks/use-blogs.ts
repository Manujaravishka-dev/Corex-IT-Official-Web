"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type Blog } from "@/lib/firestore-types";

export type { Blog };

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBlogs() {
      try {
        const q = query(collection(db, COLLECTIONS.blogs), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if (!cancelled) {
          setBlogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Blog, "id">) })));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load blogs", err);
          setError(err instanceof Error ? err.message : "Failed to load blogs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBlogs();
    return () => { cancelled = true; };
  }, []);

  return { blogs, loading, error };
}
