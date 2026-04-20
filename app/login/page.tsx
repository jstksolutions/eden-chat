"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createAuthClient } from "@/lib/auth/supabase-auth";

const EDEN_PRIMARY = "#1E2761";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_EMAIL = "demo-sima@edenseniorhc.com";
const DEMO_PASSWORD = "demo-2026";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from") || "/app/stats";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function signIn(signInEmail: string, signInPassword: string) {
    setLoading(true);
    setFormError(null);
    const supabase = createAuthClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail.trim(),
      password: signInPassword,
    });
    setLoading(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    router.push(from);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;
    await signIn(email, password);
  }

  async function handleDemoLogin() {
    if (loading) return;
    await signIn(DEMO_EMAIL, DEMO_PASSWORD);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: EDEN_PRIMARY }}
            >
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-base leading-tight">
                Eden Chat
              </p>
              <p className="text-xs text-gray-400">Admissions Dashboard</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Sign in</h2>
          <p className="text-sm text-gray-400 mb-6">
            Access is restricted to authorized Eden staff.
          </p>

          {urlError === "auth" && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Your session expired. Please sign in again.
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
                placeholder="you@edenseniorhc.com"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": EDEN_PRIMARY } as React.CSSProperties}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": EDEN_PRIMARY } as React.CSSProperties}
              />
            </div>

            {formError && <p className="text-xs text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={!email.trim() || !password || loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: EDEN_PRIMARY }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {DEMO_MODE && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => void handleDemoLogin()}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-medium border border-dashed transition-colors disabled:opacity-50"
                style={{ borderColor: EDEN_PRIMARY, color: EDEN_PRIMARY }}
              >
                Demo Login (Sima Lerman)
              </button>
              <p className="mt-2 text-[11px] text-gray-400 text-center">
                One-click sign-in for demo environments
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            ← Back to chat demo
          </Link>
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
