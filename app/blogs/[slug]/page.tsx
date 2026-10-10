import { redirect } from "next/navigation";

export default async function LegacyBlogDetailPage() {
  // Blog cards now open their Medium article externally.
  // Internal blog detail pages are no longer part of the CMS flow.
  redirect("/blogs");
}
