"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  CheckCircle2,
  Reply,
  Trash2,
  Eye,
  Loader2,
  MoreVertical,
  ArrowUpRight,
  X,
} from "lucide-react";
import { getContactMessages, updateContactStatus, deleteContactMessage, type ContactMessage } from "@/lib/firestore";
import { AdminLayout } from "@/components/admin/AdminLayout";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
] as const;

const ITEMS_PER_PAGE = 10;

export function AdminMessagesClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactMessage["status"] | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { messages: data } = await getContactMessages({
        status: statusFilter || undefined,
        limit: ITEMS_PER_PAGE,
      });
      setMessages(data);
      setTotalPages(Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE)));
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleStatusChange = async (id: string, newStatus: ContactMessage["status"]) => {
    setActionLoading(id);
    try {
      await updateContactStatus(id, newStatus);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Error updating message status:", err);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) return;

    setActionLoading(id);
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
        setShowDetail(false);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === "new") {
      handleStatusChange(msg.id, "read");
    }
    setShowDetail(true);
  };

  const getStatusBadge = (status: ContactMessage["status"]) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">New</span>;
      case "read":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">Read</span>;
      case "replied":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">Replied</span>;
      case "archived":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">Archived</span>;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#071A33]">Messages</h1>
            <p className="text-slate-500 mt-1">Manage contact form submissions</p>
          </div>
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF] transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ContactMessage["status"] | "")}
                className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF] appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-[#0057B8] animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#071A33] mb-1">No messages found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sender</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {filteredMessages.map((msg, idx) => (
                        <motion.tr
                          key={msg.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => handleViewDetail(msg)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EAF4FF] border border-[#D4E8FF] flex items-center justify-center">
                                <Mail className="w-4 h-4 text-[#0057B8]" />
                              </div>
                              <div>
                                <p className="font-medium text-[#071A33]">{msg.name}</p>
                                <p className="text-sm text-slate-500">{msg.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="font-medium text-[#071A33] truncate">{msg.subject}</p>
                            <p className="text-sm text-slate-500 truncate mt-0.5">{msg.message}</p>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(msg.status)}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(msg.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(msg.id, "read");
                                }}
                                disabled={actionLoading === msg.id || msg.status !== "new"}
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Mark as Read"
                              >
                                {actionLoading === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(msg.id, "replied");
                                }}
                                disabled={actionLoading === msg.id || msg.status === "replied"}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Mark as Replied"
                              >
                                {actionLoading === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Reply className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(msg.id);
                                }}
                                disabled={actionLoading === msg.id}
                                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Delete"
                              >
                                {actionLoading === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {filteredMessages.length} messages
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-slate-700">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowDetail(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="message-detail-title"
                className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[20px] bg-white border border-slate-200 shadow-[0_20px_60px_rgba(7,26,51,0.18)] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 md:px-7 pt-6 pb-4 border-b border-slate-100 shrink-0">
                  <div>
                    <h3 id="message-detail-title" className="text-[18px] font-bold tracking-[-0.02em] text-[#071A33]">
                      Message Details
                    </h3>
                    <p className="text-[13px] leading-[1.5] text-slate-500 mt-1">
                      From {selectedMessage.name} &middot; {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetail(false)}
                    aria-label="Close modal"
                    className="w-9 h-9 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:border-slate-300 hover:text-[#071A33] transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto px-6 md:px-7 py-6">
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-slate-500 mb-1">Name</label>
                        <p className="text-slate-900">{selectedMessage.name}</p>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-slate-500 mb-1">Email</label>
                        <a href={`mailto:${selectedMessage.email}`} className="text-slate-900 hover:text-[#0057B8] transition-colors">{selectedMessage.email}</a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Subject</label>
                      <p className="text-slate-900">{selectedMessage.subject}</p>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Status</label>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedMessage.status)}
                        <select
                          value={selectedMessage.status}
                          onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value as ContactMessage["status"])}
                          disabled={actionLoading === selectedMessage.id}
                          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Message</label>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap text-slate-700">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 md:px-7 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    disabled={actionLoading === selectedMessage.id}
                    className="px-4 py-2 rounded-lg text-red-600 font-medium hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete Message
                  </button>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}