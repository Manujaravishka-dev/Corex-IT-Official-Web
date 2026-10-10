import type { Metadata } from "next";
import { ServicesSection } from "@/components/services-section";
import { BlueFeatureSection } from "@/components/blue-feature-section";
import { ServicesHero } from "@/components/services-hero";

export const metadata: Metadata = {
  title: "Software Development Services | Corex IT",
  description:
    "Enterprise-grade services from Corex IT — Web, Mobile, Custom Software, UI/UX, Backend & API, Cloud & DevOps and IT Consulting.",
};

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <ServicesHero />
      <div id="services-content">
        <ServicesSection />
      </div>
      <BlueFeatureSection />
    </div>
  );
}