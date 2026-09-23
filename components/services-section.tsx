"use client";

import { PenTool, Code2, Smartphone, ClipboardCheck, Cloud, Briefcase } from "lucide-react";

const services = [
  {
    icon: PenTool,
    title: "Prototyping",
    desc: "Creating User Experiences,\nDesigns, Wireframes and User\nflows.",
  },
  {
    icon: Code2,
    title: "Full Stack Development",
    desc: "HTML / CSS, NodeJS / ExpressJS,\nDMS, HTTP and REST, GIT, PHP,\nPython, JAVA, RoR",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    desc: "Native (iOS, Android) Cross\nPlatform Development Flutter,\nReact Native and Xamarin\nresources",
  },
  {
    icon: ClipboardCheck,
    title: "QA Services",
    desc: "QA Automation and testing, cross\ndevice testing, regression testing",
  },
  {
    icon: Cloud,
    title: "Amazon Web Services",
    desc: "Cloud migration, hosting, server\nmanagement, optimisation etc",
  },
  {
    icon: Briefcase,
    title: "CTO and Project Management",
    desc: "Architecture, Documentation,\nScheduling and Reports",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16 md:py-20 lg:py-24">
        <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#071A33] mb-12 md:mb-16">
          Typical Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 lg:gap-x-16">
          {services.map((s) => (
            <div key={s.title} className="flex flex-col items-start">
              <s.icon className="w-6 h-6 text-slate-400 mb-4" strokeWidth={1.5} />
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#071A33]">{s.title}</h3>
              <p className="text-[13px] leading-[1.7] text-slate-500 mt-3 whitespace-pre-line">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
