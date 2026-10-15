import { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Corex Admin Panel",
  description: "Corex IT Private Company Panel Dashboard",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}