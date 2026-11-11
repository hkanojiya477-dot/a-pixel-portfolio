"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus:border-lime focus:outline-none";

type Phase = "checking" | "ready" | "invalid" | "saving" | "done";

/**
 * Landing page for the password-recovery email. Supabase can send three kinds of link,
 * so we handle all of them:
 *   ?code=…                  (PKCE — from the "Forgot password" page)
 *   ?token_hash=…&type=…     (custom email template)
 *   #access_token=…          (implicit — e.g. "Send password recovery" in the Supabase dashboard)
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as EmailOtpType | null;
      const linkError = url.searchParams.get("error_description") ?? hash.get("error_description");

      let failed = linkError ?? "";
      if (!failed) {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) failed = error.message;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) failed = error.message;
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          const { error } = await supabase.auth.setSession({
            access_token: hash.get("access_token")!,
            refresh_token: hash.get("refresh_token")!,
          });
          if (error) failed = error.message;
        }
      }

      // Remove tokens from the address bar.
      window.history.replaceState(null, "", "/admin/reset-password");

      const { data } = await supabase.auth.getUser();
      if (data.user && !failed) return setPhase("ready");
      setError(
        failed
          ? `This reset link didn't work (${failed}). Links work once and expire — request a new one.`
          : "This reset link has expired or was already used. Request a new one.",
      );
      setPhase("invalid");
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setPhase("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPhase("ready");
      return setError(error.message);
    }
    setPhase("done");
    setTimeout(() => {
      router.replace("/admin");
      router.refresh();
    }, 1200);
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[0.08em]">
            A PIXEL <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
          </p>
          <h1 className="mt-6 text-2xl font-semibold">Set a new password</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-coal p-6 md:p-8">
          {phase === "checking" && <p className="text-sm text-white/60">Checking your reset link…</p>}

          {phase === "invalid" && (
            <div className="space-y-5">
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
              <Link
                href="/admin/forgot-password"
                className="block w-full rounded-lg bg-lime py-3 text-center font-medium text-ink"
              >
                Send a new link
              </Link>
            </div>
          )}

          {phase === "done" && <p className="text-sm text-white/70">Password updated. Taking you to the dashboard…</p>}

          {(phase === "ready" || phase === "saving") && (
            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm text-white/60">New password</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={input}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-white/60">Confirm new password</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                disabled={phase === "saving"}
                className="w-full rounded-lg bg-lime py-3 font-medium text-ink transition-opacity disabled:opacity-60"
              >
                {phase === "saving" ? "Saving…" : "Save new password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
