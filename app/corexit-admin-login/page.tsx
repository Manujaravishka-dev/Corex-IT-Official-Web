"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/corexit-admin");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/corexit-admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      // Map Firebase errors to friendly messages
      if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password") || message.includes("auth/user-not-found")) {
        setError("Invalid email or password.");
      } else if (message.includes("auth/too-many-requests")) {
        setError("Too many attempts. Try again later.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F9FB]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0057B8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center bg-[#F8F9FB] px-6 py-12">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-[20px] font-extrabold tracking-tight text-[#071A33]">COREX <span className="text-[#0057B8]">IT</span></span>
          </Link>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#071A33] mt-6">Admin Login</h1>
          <p className="text-[13px] text-slate-500 mt-2">Private access · CorexIT corexit-652f5</p>
          <p className="text-[11px] text-slate-400 mt-1">No public link — direct URL only: <span className="font-mono">/corexit-admin-login</span></p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-[16px] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-5"
          noValidate
        >
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@corexit.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
            />
          </div>

          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-none bg-[#0057B8] text-white text-[14px] font-semibold hover:bg-[#003B7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Firebase Authentication · Email/Password · Project: <span className="font-mono">corexit-652f5</span>
          </p>
        </form>

        <p className="text-center text-[12px] text-slate-400 mt-6">
          <Link href="/" className="hover:text-[#0057B8]">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
