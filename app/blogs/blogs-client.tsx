"use client";

import { useMemo, useState } from "react";
import { useBlogs } from "@/hooks/use-blogs";

const ALL = "ALL";

export default function BlogsClient() {
  const { blogs, loading, error } = useBlogs();
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      const c = (b.category || "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [blogs]);

  const visibleBlogs = useMemo(() => {
    if (activeCategory === ALL) return blogs;
    return blogs.filter((b) => (b.category || "").trim() === activeCategory);
  }, [blogs, activeCategory]);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#071A33] border-b border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#071A33] via-[#0A2450] to-[#040E1F]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_75%_20%,rgba(0,87,184,0.18),transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_15%_75%,rgba(59,130,246,0.10),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute -top-24 right-[-8%] w-[560px] h-[560px] rounded-full bg-[#0057B8]/18 blur-[60px]" />
          <div className="absolute -bottom-24 left-[-6%] w-[480px] h-[480px] rounded-full bg-white/[0.04] blur-[40px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-12 md:py-16">

          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white max-w-[720px]">
            Insights on
            <br />
            <span className="font-light text-white/90">building better software.</span>
          </h1>
          <p className="text-[15px] leading-[1.7] text-white/70 max-w-[560px] mt-4">
            Practical notes on technology, development and product design from the Corex IT team.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 md:py-14">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-[14px] border border-dashed border-slate-200 bg-[#F8F8F8] p-10 text-center">
            <p className="text-[14px] text-slate-500">Unable to load articles right now. Please try again later.</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-slate-200 bg-[#F8F8F8] p-10 text-center">
            <p className="text-[14px] text-slate-500">No articles available yet.</p>
          </div>
        ) : (
          <>
            {/* Category filter bar */}
<div className="flex items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[ALL, ...categories].map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-2 rounded-none border text-[12px] font-semibold uppercase tracking-[0.04em] transition-colors duration-200 ${
                      isActive
                        ? "bg-[#0057B8] border-[#0057B8] text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-[#0057B8] hover:text-[#0057B8] hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {visibleBlogs.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-slate-200 bg-[#F8F8F8] p-10 text-center mt-6">
                <p className="text-[14px] text-slate-500">No blogs found in this category.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {visibleBlogs.map((post) => (
                  <a
                    key={post.id}
                    href={post.mediumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-[16px] bg-white border border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(7,26,51,0.06)] transition-all"
                  >
                    <div className="relative h-[200px] overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
<div className="flex items-center gap-2">
                        {post.category && (
                          <span className="inline-block uppercase tracking-[0.08em] text-[10px] font-semibold text-[#0057B8]">{post.category}</span>
                        )}
                        {post.authorName && (
                          <p className="text-[11px] tracking-[0.08em] uppercase text-slate-400">{post.authorName}</p>
                        )}
                      </div>
                      <h3 className="text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] text-[#071A33] mt-2 group-hover:text-[#0057B8] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[13px] leading-[1.6] text-slate-500 mt-2 line-clamp-2 flex-1">{post.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#071A33] group-hover:text-[#0057B8] transition-colors">
                        Read Article
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform group-hover:translate-x-0.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

