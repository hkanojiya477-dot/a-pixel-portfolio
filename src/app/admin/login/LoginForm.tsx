"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const input =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus:border-lime focus:outline-none";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm text-white/60">Email</span>
        <input name="email" type="email" defaultValue={state.email} required autoComplete="email" className={input} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-white/60">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={input} />
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-lime py-3 font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
