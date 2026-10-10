import { Metadata } from "next";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export const metadata: Metadata = {
  title: "Settings — Corex Admin Panel",
  description: "Admin panel settings",
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}