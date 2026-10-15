import { Metadata } from "next";
import { AdminMessagesClient } from "@/components/admin/AdminMessagesClient";

export const metadata: Metadata = {
  title: "Messages — Corex Admin Panel",
  description: "Manage contact messages",
};

export default function AdminMessagesPage() {
  return <AdminMessagesClient />;
}