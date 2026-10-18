"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import {
  Briefcase,
  Sparkles,
  Globe,
  ArrowRight,
} from "lucide-react";

const infoRow = [
  {
    Icon: Briefcase,
    label: "Open Positions",
    title: "Join our team",
    desc: "Engineering, design and product roles.",
    href: "/contact",
    cta: "View roles",
  },
  {
    Icon: Sparkles,
    label: "Internships",
    title: "Kickstart your career",
    desc: "Hands-on experience with real projects.",
    href: "/contact",
    cta: "Explore",
  },
  {
    Icon: Globe,
    label: "Remote Opportunities",
    title: "Work flexibly",
    desc: "Collaborate from anywhere in Sri Lanka.",
    href: "/contact",
    cta: "Learn more",
  },
];

export function CareerSection() {
  const { ref, isInView } = useInView({ threshold: 0.12 });
  const { ref: bottomRef, isInView: bottomInView } = useInView({ threshold: 0.12 });

  return (
    <section id="career" className="relative overflow-hidden border-t border-slate-100 bg-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-r from-[#092C68] via-[#07569D] to-[#08A6E8] text-white">
        {/* Layered angular shapes, intentionally no imagery or dotted decorations. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[12%] top-[-50%] h-[125%] w-[76%] rotate-[32deg] bg-[#092452]/25" />
          <div className="absolute left-[25%] top-[-75%] h-[150%] w-[58%] rotate-[38deg] bg-[#2D9BD2]/20" />
          <div className="absolute -bottom-[75%] left-[20%] h-[120%] w-[80%] -rotate-[30deg] bg-[#003E86]/20" />
          <div className="absolute right-[-15%] top-[-30%] h-[95%] w-[35%] rotate-[35deg] border border-white/10" />
        </div>
        <div ref={ref} className="relative mx-auto flex min-h-[440px] max-w-[1440px] items-center px-6 py-20 md:min-h-[530px] md:px-10 md:py-28">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="max-w-[690px]">
            <p className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80"><span className="h-px w-9 bg-white/70" />Career at Corex IT</p>
            <h1 className="text-[clamp(2.5rem,5vw,4.4rem)] font-bold leading-[1.1] tracking-[-0.045em]">Build your career<br /><span className="font-light">with Corex IT.</span></h1>
            <p className="mt-7 max-w-[570px] text-[15px] leading-[1.8] text-white/85 md:text-[17px]">Join a team that builds meaningful digital products, solves real-world problems, and grows together. Work alongside a modern technology team that values clean code, continuous learning and real ownership.</p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <a href="#career-opportunities" className="inline-flex items-center gap-3 rounded-lg bg-white px-6 py-3.5 text-[14px] font-semibold text-[#064D96] shadow-lg transition-colors hover:bg-[#E8F4FF]">View Open Positions <ArrowRight className="h-4 w-4" /></a>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85"><span className="h-2 w-2 rounded-full bg-emerald-400" />We&apos;re hiring</span>
            </div>
          </motion.div>
        </div>
      </div>
      <div id="career-opportunities" className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 md:py-20">
        {/* Bottom compact horizontal career info row */}
        <motion.div
          ref={bottomRef}
          initial={{ opacity: 0, y: 14 }}
          animate={bottomInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 lg:mt-12 pt-8 border-t border-slate-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">
              Explore opportunities
            </p>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0057B8]" />
              Colombo · Hybrid · Remote
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {infoRow.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={bottomInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={item.href}
                  className="group flex flex-col h-full rounded-none bg-[#F8F8F8] border border-[#E5E7EB] p-5 hover:bg-white hover:border-[#0057B8]/20 hover:shadow-[0_8px_24px_rgba(0,87,184,0.06)] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#0057B8]">
                      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:bg-[#0057B8] group-hover:border-[#0057B8] transition-colors">
                        <item.Icon
                          className="w-3.5 h-3.5 text-[#0057B8] group-hover:text-white transition-colors"
                          strokeWidth={1.7}
                        />
                      </span>
                      {item.label}
                    </span>
                    <span className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:bg-[#071A33] group-hover:text-white group-hover:border-[#071A33] transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </span>
                  </div>
                  <h4 className="text-[14px] font-semibold tracking-[-0.01em] text-[#071A33] mt-4">
                    {item.title}
                  </h4>
                  <p className="text-[12.5px] leading-[1.6] text-slate-500 mt-1 flex-1">
                    {item.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#071A33] group-hover:text-[#0057B8] transition-colors">
                    {item.cta}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
