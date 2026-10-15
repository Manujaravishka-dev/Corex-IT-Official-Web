"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Database,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/private-company-panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/private-company-panel/reviews", label: "Reviews", icon: Star },
  { href: "/private-company-panel/messages", label: "Messages", icon: MessageSquare },
  { href: "/private-company-panel/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
            <Link href="/private-company-panel" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0057B8] flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#071A33]">Corex<span className="text-[#0057B8]">Admin</span></span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#071A33] transition-colors"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/private-company-panel" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#EAF4FF] text-[#0057B8] shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#071A33]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#0057B8]" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200">
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Connected to Firebase</span>
            </div>
            <Link
              href="/"
              className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-[#071A33] hover:bg-slate-50 rounded-lg transition-colors mt-2 flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Users className="w-4 h-4" />
              View Website
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm"
            : "bg-transparent"
        }`}>
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#071A33] transition-colors"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl lg:text-2xl font-bold text-[#071A33] hidden sm:block">
                Private Company Panel
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-[#071A33] hover:bg-slate-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Public Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}