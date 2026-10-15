"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { getTotalCounts, getReviews, getContactMessages } from "@/lib/firestore";
import type { Review, ContactMessage } from "@/lib/firestore";

interface Stats {
  totalReviews: number;
  totalContactMessages: number;
  pendingReviews: number;
  newContactMessages: number;
}

interface RecentData {
  recentReviews: Review[];
  recentMessages: ContactMessage[];
}

export function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    totalContactMessages: 0,
    pendingReviews: 0,
    newContactMessages: 0,
  });
  const [recentData, setRecentData] = useState<RecentData>({
    recentReviews: [],
    recentMessages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, reviewsData, messagesData] = await Promise.all([
          getTotalCounts(),
          getReviews({ limit: 5 }),
          getContactMessages({ limit: 5 }),
        ]);

        if (!cancelled) {
          setStats(statsData);
          setRecentData({
            recentReviews: reviewsData.reviews,
            recentMessages: messagesData.messages,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching dashboard data:", err);
          setError("Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-[#071A33]">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-white border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-8 bg-slate-100 rounded w-1/2" />
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded" />)}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-red-700 mb-2">Failed to load dashboard</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: Star,
      color: "bg-amber-100 text-amber-600",
      iconColor: "text-amber-600",
      trend: "+12%",
      trendLabel: "vs last month",
      href: "/private-company-panel/reviews",
    },
    {
      label: "Contact Messages",
      value: stats.totalContactMessages,
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600",
      iconColor: "text-blue-600",
      trend: "+8%",
      trendLabel: "vs last month",
      href: "/private-company-panel/messages",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
      iconColor: "text-orange-600",
      trend: stats.pendingReviews > 0 ? "Needs attention" : "All caught up",
      trendLabel: "",
      href: "/private-company-panel/reviews?status=pending",
    },
    {
      label: "New Messages",
      value: stats.newContactMessages,
      icon: Users,
      color: "bg-emerald-100 text-emerald-600",
      iconColor: "text-emerald-600",
      trend: stats.newContactMessages > 0 ? "Unread" : "All read",
      trendLabel: "",
      href: "/private-company-panel/messages?status=new",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#071A33]">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-xl bg-white border border-slate-200 p-6 hover:border-[#0057B8]/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="text-3xl font-bold text-[#071A33] mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs font-medium text-emerald-600">{card.trend}</span>
                    {card.trendLabel && <span className="text-xs text-slate-400">{card.trendLabel}</span>}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} strokeWidth={1.8} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">View details</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0057B8] transition-colors" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Reviews */}
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#071A33]">Recent Reviews</h2>
            <Link
              href="/private-company-panel/reviews"
              className="text-sm font-medium text-[#0057B8] hover:text-[#003B7A] transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentData.recentReviews.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p>No reviews yet</p>
              </div>
            ) : (
              recentData.recentReviews.map((review) => (
                <div key={review.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#071A33] truncate">{review.name}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          review.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                          review.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {review.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{review.comment}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= review.rating ? "fill-current" : ""}`} strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#071A33]">Recent Messages</h2>
            <Link
              href="/private-company-panel/messages"
              className="text-sm font-medium text-[#0057B8] hover:text-[#003B7A] transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentData.recentMessages.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p>No messages yet</p>
              </div>
            ) : (
              recentData.recentMessages.map((msg) => (
                <div key={msg.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#071A33] truncate">{msg.name}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          msg.status === "new" ? "bg-blue-100 text-blue-700" :
                          msg.status === "read" ? "bg-slate-100 text-slate-700" :
                          msg.status === "replied" ? "bg-emerald-100 text-emerald-700" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{msg.subject}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {msg.email}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-white border border-slate-200 p-6"
      >
        <h2 className="text-lg font-semibold text-[#071A33] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/private-company-panel/reviews?status=pending"
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0057B8]/30 hover:bg-[#EAF4FF] transition-all"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
            <p className="font-medium text-[#071A33]">Moderate Pending Reviews</p>
            <p className="text-sm text-slate-500 mt-1">{stats.pendingReviews} awaiting approval</p>
          </Link>
          <Link
            href="/private-company-panel/messages?status=new"
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0057B8]/30 hover:bg-[#EAF4FF] transition-all"
          >
            <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-[#071A33]">Reply to New Messages</p>
            <p className="text-sm text-slate-500 mt-1">{stats.newContactMessages} unread messages</p>
          </Link>
          <Link
            href="/private-company-panel/reviews"
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0057B8]/30 hover:bg-[#EAF4FF] transition-all"
          >
            <Star className="w-6 h-6 text-amber-600 mb-2" />
            <p className="font-medium text-[#071A33]">Manage All Reviews</p>
            <p className="text-sm text-slate-500 mt-1">{stats.totalReviews} total reviews</p>
          </Link>
          <Link
            href="/private-company-panel/messages"
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0057B8]/30 hover:bg-[#EAF4FF] transition-all"
          >
            <Users className="w-6 h-6 text-[#0057B8] mb-2" />
            <p className="font-medium text-[#071A33]">View All Messages</p>
            <p className="text-sm text-slate-500 mt-1">{stats.totalContactMessages} total messages</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}