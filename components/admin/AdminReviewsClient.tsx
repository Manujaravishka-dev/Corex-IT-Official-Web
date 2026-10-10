"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { getReviews, updateReviewStatus, deleteReview, type Review } from "@/lib/firestore";
import { AdminLayout } from "@/components/admin/AdminLayout";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

const ITEMS_PER_PAGE = 10;

export function AdminReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Review["status"] | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastDoc, setLastDoc] = useState<import("firebase/firestore").DocumentSnapshot | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { reviews: data, lastDoc: newLastDoc } = await getReviews({
        status: statusFilter || undefined,
        limit: ITEMS_PER_PAGE,
      });
      setReviews(data);
      setLastDoc(newLastDoc);
      // For simplicity, we'll estimate total pages
      // In production, you'd want a separate count query
      setTotalPages(Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE)));
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    return matchesSearch;
  });

  const handleStatusChange = async (id: string, newStatus: Review["status"]) => {
    setActionLoading(id);
    try {
      await updateReviewStatus(id, newStatus);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (err) {
      console.error("Error updating review status:", err);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

    setActionLoading(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Review["status"]) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">Approved</span>;
      case "pending":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Pending</span>;
      case "rejected":
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Rejected</span>;
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
            <h1 className="text-2xl font-bold text-[#071A33]">Reviews</h1>
            <p className="text-slate-500 mt-1">Manage and moderate client reviews</p>
          </div>
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF] transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Review["status"] | "")}
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
              <p className="text-slate-500">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#071A33] mb-1">No reviews found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reviewer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {filteredReviews.map((review, idx) => (
                        <motion.tr
                          key={review.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-[#071A33]">{review.name}</p>
                              <p className="text-sm text-slate-500">{review.email}</p>
                              {review.company && <p className="text-xs text-slate-400">{review.company}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-amber-400">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star key={n} className={`w-4 h-4 ${n <= review.rating ? "fill-current" : ""}`} strokeWidth={1.5} />
                              ))}
                              <span className="text-sm font-medium text-slate-700 ml-1">{review.rating}.0</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="text-slate-600 line-clamp-2">{review.comment}</p>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(review.status)}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(review.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleStatusChange(review.id, "approved")}
                                disabled={actionLoading === review.id || review.status === "approved"}
                                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Approve"
                              >
                                {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleStatusChange(review.id, "rejected")}
                                disabled={actionLoading === review.id || review.status === "rejected"}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Reject"
                              >
                                {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDelete(review.id)}
                                disabled={actionLoading === review.id}
                                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Delete"
                              >
                                {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
                  Showing {filteredReviews.length} reviews
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
    </AdminLayout>
  );
}