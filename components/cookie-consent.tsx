"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "cookie-consent-accepted";
const DENIED_KEY = "cookie-consent-denied";
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

    // If a choice was already made, never show
    try {
      if (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(DENIED_KEY)) {
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
        // Re-check choice before showing
        try {
          if (!localStorage.getItem(STORAGE_KEY) && !localStorage.getItem(DENIED_KEY)) {
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
      localStorage.removeItem(DENIED_KEY);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleDeny = () => {
    clearTimer();
    try {
      localStorage.setItem(DENIED_KEY, "true");
      localStorage.removeItem(DISMISSED_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setVisible(false);
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[60] bottom-5 right-5 w-[420px] max-w-[calc(100vw-40px)]"
          role="dialog"
          aria-modal="false"
          aria-label="Cookie consent"
        >
          <div className="rounded-[7px] border border-[#BDBDB8] bg-[#E8E7E2] px-[15px] py-[12px] text-[#242424] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <p className="mb-[8px] text-left text-[13px] font-normal leading-[19px] text-[#242424]">
              This website uses cookies to measure and improve your experience. You can
              manage your cookie preferences below.
            </p>

            <div className="flex items-center justify-start gap-[8px]">
              <button
                onClick={handleAccept}
                className="h-[30px] rounded-[9px] border border-[#BDBDB8] bg-transparent px-[12px] py-[5px] text-[13px] font-normal text-[#242424] transition-colors duration-200 hover:bg-[#DCDBD5] hover:border-[#A9A9A3] active:bg-[#D2D1CB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8F8F88]"
              >
                Accept all
              </button>
              <button
                onClick={handleDeny}
                className="h-[30px] rounded-[9px] border border-[#BDBDB8] bg-transparent px-[12px] py-[5px] text-[13px] font-normal text-[#242424] transition-colors duration-200 hover:bg-[#DCDBD5] hover:border-[#A9A9A3] active:bg-[#D2D1CB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8F8F88]"
              >
                Deny
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
