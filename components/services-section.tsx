"use client";

import Image from "next/image";
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
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-16 md:pt-20 lg:pt-24 pb-12 md:pb-16">
        <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#071A33] mb-4">
          Typical Services
        </h2>
        <div className="h-px w-8 bg-[#0057B8] mb-8 md:mb-12" aria-hidden="true" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 lg:gap-x-16">
          {services.map((s) => (
            <div key={s.title} className="group flex flex-col items-start">
              <s.icon
                className="w-7 h-7 text-slate-400 mb-4 transition duration-200 ease-out group-hover:text-[#0057B8] group-hover:-translate-y-0.5"
                strokeWidth={1.5}
              />
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#071A33] transition-colors duration-200 group-hover:text-[#0057B8]">{s.title}</h3>
              <p className="text-[13px] leading-[1.7] text-slate-500 mt-3 max-w-[320px] whitespace-pre-line">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <div className="w-[85%] max-w-[340px] md:max-w-[400px] lg:max-w-[480px]">
            <Image
              src="/image.png"
              alt="Corex IT typical services illustration"
              width={1002}
              height={586}
              sizes="(min-width: 1024px) 480px, (min-width: 768px) 400px, 340px"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
