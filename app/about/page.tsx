import type { Metadata } from "next";
import Link from "next/link";
import { AboutHero } from "@/components/about-hero";

export const metadata: Metadata = {
  title: "About Us | Corex IT",
  description:
    "Learn about Corex IT — Sri Lankan software engineering partner helping businesses build reliable, scalable digital products.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      <AboutHero />

      {/* vision / mission / what we do */}
      <section id="about-content" className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
          <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-[#0057B8] mb-3">Our Vision</h2>
            <p className="text-[15px] leading-[1.75] font-normal text-slate-600">
            To be a trusted technology partner that empowers businesses to work smarter,
            innovate faster, and grow sustainably through reliable and well-engineered
            software solutions.
          </p>
          </div>
          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-[#0057B8] mb-3">Our Mission</h2>
            <p className="text-[15px] leading-[1.75] font-normal text-slate-600">
              To build secure, scalable, and reliable digital solutions 
              that solve real business challenges through modern 
              technology and quality-driven engineering.

            </p>
          </div>
          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-[#0057B8] mb-3">What We Do</h2>
            <p className="text-[15px] leading-[1.75] font-normal text-slate-600">
              We provide end-to-end technology solutions, 
              including web and mobile application development, 
              POS systems, custom software, UI/UX design, backend and 
              API development, cloud and DevOps, and IT consulting 
              for growing teams and enterprises.
            </p>
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-12 gap-8 pt-10 border-t border-slate-100">
          <div className="lg:col-span-6">
            <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-3">Development Philosophy</h3>
            <p className="text-[15px] leading-[1.8] font-serif italic text-slate-600">              
              We architect solutions, not just write code. Every project is thoughtfully engineered using clean code, 
              proven patterns, and modern development practices—with a strong focus on long-term maintainability. 
              Every technical decision is guided by business goals, performance, security, scalability, and user experience.
            </p>
          </div>
          <div className="lg:col-span-6">
            <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-3">Technology Approach</h3>
            <p className="text-[15px] leading-[1.8] font-serif italic text-slate-600">              
              We choose technology based on what best serves the product—not simply what is trending. 
              Our technology stack combines modern, proven platforms such as React, Next.js, .NET, Java, 
              Spring Boot, Node.js, Python, PostgreSQL, MySQL, MongoDB, Docker, and leading cloud platforms. 
              Each technology is applied with consistency, scalability, security, and enterprise-grade 
              engineering practices in mind.
            </p>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-3">Quality-Focused Delivery</h3>
            <p className="text-[15px] leading-[1.8] font-serif italic text-slate-600">              
             Quality is built into every stage of our process—from discovery and design through development, 
             testing, deployment, and ongoing support. We work in iterative cycles with regular checkpoints, 
             thorough quality assurance, and continuous validation to ensure reliable outcomes. Our systems are 
             designed to be observable, well-documented, maintainable, and ready to evolve with the needs of 
             the business.
            </p>
          </div>
          <div className="lg:col-span-6">
            <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-[#071A33] mb-3">Professional Values</h3>
            <ul className="text-[15px] leading-[1.8] font-serif italic text-slate-600">              
              <li className="flex gap-2"><span className="text-[#0057B8]">—</span> Clarity and transparency in every interaction</li>
              <li className="flex gap-2"><span className="text-[#0057B8]">—</span> Ownership, responsibility, and accountability</li>
              <li className="flex gap-2"><span className="text-[#0057B8]">—</span> A strong commitment to maintainability and security</li>
              <li className="flex gap-2"><span className="text-[#0057B8]">—</span> Continuous improvement, innovation, and learning</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-[18px] bg-[#071A33] text-white p-7 md:p-8 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#0057B8]/20 blur-[1px] pointer-events-none" />
          <h3 className="text-[14px] font-semibold tracking-[0.12em] uppercase text-[#8AB6FF] mb-3">Why Choose Corex IT</h3>
          <p className="text-[15px] leading-[1.8] font-serif italic text-white/80 max-w-[760px]">
            Clients choose Corex IT for reliable engineering, clear communication, and a collaborative 
            approach that keeps every project focused and predictable. Whether modernising an existing 
            product or building something from the ground up, we combine technical expertise with a deep 
            understanding of business needs to deliver software that is secure, scalable, maintainable, 
            and built to support long-term growth.
          </p>
          <div className="mt-6">
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-none bg-white text-[#071A33] text-[13px] font-semibold hover:bg-white/95 transition-colors">
              Let’s Build Something Great 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}