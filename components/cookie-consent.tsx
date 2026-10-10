"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { X, Cookie, ShieldCheck } from "lucide-react";

const STORAGE_KEY = "cookie-consent-accepted";
const DISMISSED_KEY = "cookie-consent-dismissed-at";
const RESHOW_DELAY_MS = 60_000; // 1 minute

export function CookieConsent() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/corexit-admin");
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    if (!mounted) return;

    // If already accepted, never show
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        return;
      }
    } catch {
      // localStorage unavailable (SSR/private mode) — do not show to avoid errors
      return;
    }

    // Check if recently dismissed (Close X) — wait remaining time
    let initialDelay = 0;
    try {
      const dismissedAt = localStorage.getItem(DISMISSED_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - Number(dismissedAt);
        if (!Number.isNaN(elapsed) && elapsed < RESHOW_DELAY_MS) {
          initialDelay = RESHOW_DELAY_MS - elapsed;
        } else if (elapsed >= RESHOW_DELAY_MS) {
          // Expired — clear and show immediately
          localStorage.removeItem(DISMISSED_KEY);
        }
      }
    } catch {
      // ignore storage errors
    }

    if (initialDelay > 0) {
      timerRef.current = setTimeout(() => {
        // Re-check accepted before showing
        try {
          if (!localStorage.getItem(STORAGE_KEY)) {
            setVisible(true);
          }
        } catch {
          setVisible(true);
        }
      }, initialDelay);
    } else {
      // Show shortly after mount for smooth entrance
      const t = setTimeout(() => setVisible(true), 400);
      timerRef.current = t;
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAccept = () => {
    clearTimer();
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.removeItem(DISMISSED_KEY);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleClose = () => {
    clearTimer();
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    } catch {
      // ignore
    }
    // Show again after 1 minute if not accepted
    timerRef.current = setTimeout(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setVisible(true);
        }
      } catch {
        setVisible(true);
      }
    }, RESHOW_DELAY_MS);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, []);

  if (isAdmin) return null;
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[60] bottom-5 right-5 sm:bottom-8 sm:right-8 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px]"
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
        >
          {/* Main Card with Premium Dark Glassmorphism — compact sharp square */}
          <div className="relative overflow-hidden rounded-none bg-[#07111F]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_64px_rgba(2,8,20,0.6),0_4px_16px_rgba(0,0,0,0.3)] p-4">
            
            {/* Ambient Background Glow Accents */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-blue-500/10 blur-[32px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/10 blur-[32px] pointer-events-none" />
            
            {/* Subtle top border highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-none bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                  <Cookie className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-[14px] font-semibold tracking-tight text-white">
                  Cookie Preferences
                </h2>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close cookie banner"
                className="w-7 h-7 rounded-none bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body Text */}
            <p className="relative text-[12.5px] leading-[1.6] text-white/70 mb-3">
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to enhance your experience and analyze site traffic.
            </p>

            {/* Actions */}
            <div className="relative flex items-center gap-3">
              <button
                onClick={handleAccept}
                className="group relative flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-none bg-gradient-to-b from-white to-slate-100 text-[#07111F] text-[13px] font-medium shadow-[0_4px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Accept All
                </span>
              </button>
            </div>

            {/* Footer helper note */}
            <div className="relative mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
              <span>Manage settings anytime</span>
              <span className="text-white/25">Auto-hides in 1m</span>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}