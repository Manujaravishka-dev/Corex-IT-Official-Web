"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Shield,
  Bell,
  User,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export function AdminSettingsClient() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    // Firebase settings (read-only display)
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not configured",
    // Panel settings
    panelName: "Corex Admin Panel",
    autoRefresh: true,
    refreshInterval: 30,
    emailNotifications: true,
    newReviewAlerts: true,
    newMessageAlerts: true,
    // Security
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    // Appearance
    theme: "light" as "light" | "dark" | "system",
    compactMode: false,
  });

  const handleChange = (key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // In a real app, you'd save to Firebase or a config document
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#071A33]">Settings</h1>
            <p className="text-slate-500 mt-1">Configure your admin panel preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-[#0057B8] text-white font-medium hover:bg-[#003B7A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </motion.div>

        {/* Firebase Configuration (Read-only) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Database className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-lg font-semibold text-[#071A33]">Firebase Configuration</h2>
          </div>
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <p className="text-sm text-slate-600 mb-4">
              Firebase configuration is managed through environment variables. These values are read-only and cannot be changed from the admin panel.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Project ID</dt>
                <dd className="font-mono text-[#071A33] mt-1">{settings.projectId}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Auth Domain</dt>
                <dd className="font-mono text-[#071A33] mt-1">{process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Not configured"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Database URL</dt>
                <dd className="font-mono text-[#071A33] mt-1">{process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "Not configured"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Storage Bucket</dt>
                <dd className="font-mono text-[#071A33] mt-1">{process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "Not configured"}</dd>
              </div>
            </dl>
          </div>
          <div className="p-6">
            <p className="text-xs text-slate-500">
              <strong>Security Note:</strong> Never commit Firebase credentials to version control. Use environment variables in Vercel and <code className="font-mono bg-slate-100 px-1 rounded">.env.local</code> for local development.
            </p>
          </div>
        </motion.div>

        {/* Panel Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <User className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-lg font-semibold text-[#071A33]">Panel Settings</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#071A33] mb-2">Panel Name</label>
              <input
                type="text"
                value={settings.panelName}
                onChange={(e) => handleChange("panelName", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#071A33] mb-2">Auto Refresh Interval (seconds)</label>
                <input
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => handleChange("refreshInterval", Number(e.target.value))}
                  min="10"
                  max="300"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => handleChange("autoRefresh", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0057B8] focus:ring-[#0057B8]"
                  />
                  <span className="text-sm text-[#071A33]">Enable auto-refresh</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-lg font-semibold text-[#071A33]">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0057B8] focus:ring-[#0057B8]"
              />
              <span className="text-sm text-[#071A33]">Enable email notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.newReviewAlerts}
                onChange={(e) => handleChange("newReviewAlerts", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0057B8] focus:ring-[#0057B8]"
              />
              <span className="text-sm text-[#071A33]">Alert on new review submissions</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.newMessageAlerts}
                onChange={(e) => handleChange("newMessageAlerts", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0057B8] focus:ring-[#0057B8]"
              />
              <span className="text-sm text-[#071A33]">Alert on new contact messages</span>
            </label>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-lg font-semibold text-[#071A33]">Security</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#071A33] mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange("sessionTimeout", Number(e.target.value))}
                  min="5"
                  max="480"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#071A33] mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleChange("maxLoginAttempts", Number(e.target.value))}
                  min="3"
                  max="20"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
                />
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Authentication is not yet implemented for this admin panel. The panel is currently accessible via the private URL only. Implement proper authentication (Firebase Auth, NextAuth, etc.) before deploying to production.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <User className="w-5 h-5 text-[#0057B8]" />
            <h2 className="text-lg font-semibold text-[#071A33]">Appearance</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#071A33] mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange("theme", e.target.value as "light" | "dark" | "system")}
                className="w-full max-w-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0057B8] focus:ring-2 focus:ring-[#EAF4FF]"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleChange("compactMode", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0057B8] focus:ring-[#0057B8]"
              />
              <span className="text-sm text-[#071A33]">Compact mode (denser tables)</span>
            </label>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl bg-white border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-800">Clear All Data</p>
                <p className="text-sm text-red-600 mt-1">Permanently delete all reviews and contact messages from Firestore. This action cannot be undone.</p>
              </div>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                onClick={() => {
                  if (confirm("ARE YOU SURE? This will permanently delete ALL reviews and messages. Type 'DELETE' to confirm.")) {
                    const input = prompt("Type 'DELETE' to confirm:");
                    if (input === "DELETE") {
                      alert("Data clearing not implemented in demo. In production, this would call a Firebase Admin SDK function.");
                    }
                  }
                }}
              >
                Clear All Data
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}