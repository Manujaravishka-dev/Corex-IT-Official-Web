import type { Metadata } from "next";
import { CareerSection } from "@/components/career-section";

export const metadata: Metadata = {
  title: "Careers | Corex IT",
  description:
    "Build your career with Corex IT — join a team that builds meaningful digital products, solves real-world problems, and grows together.",
};

export default function CareerPage() {
  return (
    <div className="bg-white">
      <CareerSection />
    </div>
  );
}