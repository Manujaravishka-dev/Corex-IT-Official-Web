import type { Metadata } from "next";
import ProjectsClient from "./projects-client";
export const metadata: Metadata = { title: "Our Projects | Corex IT", description: "Explore the projects built by COREX IT SOLUTIONS." };
export default function ProjectsPage() { return <ProjectsClient />; }