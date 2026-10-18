import ProjectDetailClient from "./project-detail-client";
export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 return <ProjectDetailClient slug={slug} />;
}