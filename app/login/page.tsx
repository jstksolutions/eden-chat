"use client";

import { useState } from "react";
import { createAuthClient } from "@/lib/auth/supabase-auth";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const EDEN_GREEN = "#2E5A3A";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setFormError(null);

    const supabase = createAuthClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setFormError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: EDEN_GREEN }}
            >
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-base leading-tight">
                Eden Care Assistant
              </p>
              <p className="text-xs text-gray-400">Admissions Dashboard</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                We sent a login link to{" "}
                <span className="font-medium text-gray-700">{email}</span>.
                Click the link to access the dashboard.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Login form ── */
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Sign in
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                We&apos;ll email you a magic link — no password needed.
              </p>

              {/* URL error (e.g. expired link) */}
              {urlError === "auth" && (
                <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  That link has expired or is invalid. Please request a new one.
                </div>
              )}

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-600 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": EDEN_GREEN } as React.CSSProperties}
                  />
                </div>

                {formError && (
                  <p className="text-xs text-red-600">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={!email.trim() || loading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: EDEN_GREEN }}
                >
                  {loading ? "Sending…" : "Send Magic Link"}
                </button>
              </form>

              <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
                Access is restricted to authorized staff.
                <br />
                Contact your administrator to request access.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/demo" className="hover:text-gray-600 transition-colors">
            ← Back to Setup
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
