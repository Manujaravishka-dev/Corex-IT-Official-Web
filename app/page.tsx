import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { BlueFeatureSection } from "@/components/blue-feature-section";
import { IndustriesSection } from "@/components/industries-section";
import { CompanyHighlightsSection } from "@/components/company-highlights-section";
import { ClientBrandsSection } from "@/components/client-brands-section";
import { ProcessSection } from "@/components/process-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FinalCta } from "@/components/final-cta";

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* Technology marquee temporarily hidden — keep for future use */}
      {/* <HeroCapabilitiesBar /> */}
      <ServicesSection />
      <CompanyHighlightsSection /> 
      <ClientBrandsSection />     
      <IndustriesSection />                  
      <BlueFeatureSection />
      <ProcessSection />
      <TestimonialsSection />
      <FinalCta />
    </>
  );
}
