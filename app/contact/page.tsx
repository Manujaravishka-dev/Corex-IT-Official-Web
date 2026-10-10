import type { Metadata } from "next";
import { ContactSection } from "@/components/contact-section";

export const metadata: Metadata = {
  title: "Contact Us | Corex IT",
  description:
    "Get in touch with Corex IT — tell us about your project and let's explore how we can help you build a reliable digital solution.",
};

export default function ContactPage() {
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
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white max-w-[640px]">
            Tell us about
            <br />
            <span className="font-light text-white/90">your project.</span>
          </h1>
          <p className="text-[15px] leading-[1.7] text-white/70 max-w-[560px] mt-4">
            Have an idea worth building? Share a few details and we will get back to you to discuss how Corex IT can help you design, build and scale it.
          </p>
        </div>
      </section>
      <ContactSection />
    </div>
  );
}