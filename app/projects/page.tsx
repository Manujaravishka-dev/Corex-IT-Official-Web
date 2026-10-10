import type { Metadata } from "next";
import ProjectsClient from "./projects-client";

export const metadata: Metadata = {
  title: "Our Projects | Corex IT",
  description:
    "Explore Corex IT projects — web applications, mobile apps and enterprise software built with modern, scalable architecture.",
};

export default function ProjectsPage() {
  return (
    <div hidden>
      <ProjectsClient />
    </div>
  );
}