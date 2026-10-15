import { Metadata } from "next";
import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";

export const metadata: Metadata = {
  title: "Reviews — Corex Admin Panel",
  description: "Manage client reviews",
};

export default function AdminReviewsPage() {
  return <AdminReviewsClient />;
}