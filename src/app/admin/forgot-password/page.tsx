"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const input =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus:border-lime focus:outline-none";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) return setError("Supabase isn't connected yet.");
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (error) {
      setStatus("idle");
      setError(error.message || "Couldn't send the email. Please try again in a minute.");
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[0.08em]">
            A PIXEL <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
          </p>
          <h1 className="mt-6 text-2xl font-semibold">Reset password</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-coal p-6 md:p-8">
          {status === "sent" ? (
            <p className="text-sm text-white/70">
              If that email belongs to an admin, a reset link is on its way. Open the <b>newest</b> email in this same
              browser and click the link.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm text-white/60">Admin email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={input}
                />
              </label>
              {error && (
                <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-lg bg-lime py-3 font-medium text-ink transition-opacity disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm">
          <Link href="/admin/login" className="text-white/50 hover:text-lime">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
