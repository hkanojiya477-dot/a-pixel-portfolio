"use client";

import { useActionState } from "react";
import { SERVICES } from "@/lib/services";
import { sendMessage, type ContactState } from "./actions";

const field =
  "w-full border-b border-white/20 bg-transparent py-4 text-lg text-white placeholder:text-white/30 transition-colors focus:border-lime focus:outline-none";
const label = "text-xs uppercase tracking-[0.25em] text-white/50";

export default function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, {});
  const v = state.values;

  if (state.ok) {
    return (
      <div className="flex flex-col justify-center rounded-2xl border border-lime/30 bg-lime/5 p-10 md:p-14" role="status">
        <p className="font-serif text-5xl italic text-lime">Thank you.</p>
        <p className="mt-4 max-w-md text-lg text-white/70">
          Your message is in. We&apos;ll get back to you within one to two working days.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-10 rounded-2xl border border-white/10 bg-coal p-6 md:p-12" noValidate>
      {/* Honeypot — hidden from people, catches bots */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <label className="block">
          <span className={label}>Your name *</span>
          <input name="name" defaultValue={v?.name} required maxLength={100} autoComplete="name" className={field} placeholder="Jane Doe" />
        </label>
        <label className="block">
          <span className={label}>Email *</span>
          <input
            name="email"
            defaultValue={v?.email}
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={field}
            placeholder="jane@brand.com"
          />
        </label>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <label className="block">
          <span className={label}>Service</span>
          <select name="service" defaultValue={v?.service ?? ""} className={`${field} cursor-pointer [&>option]:bg-ink`}>
            <option value="">Not sure yet</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Project size</span>
          <select name="budget" defaultValue={v?.budget ?? ""} className={`${field} cursor-pointer [&>option]:bg-ink`}>
            <option value="">Select…</option>
            <option value="small">Small — a single deliverable</option>
            <option value="medium">Medium — a few connected pieces</option>
            <option value="large">Large — full brand or campaign</option>
            <option value="retainer">Ongoing monthly support</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className={label}>Tell us about your project *</span>
        <textarea
          name="message"
          defaultValue={v?.message}
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className={`${field} resize-y`}
          placeholder="What are you building, and how can we help?"
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-lime px-8 py-5 font-medium text-ink transition-opacity disabled:opacity-60 md:w-auto"
      >
        {pending ? "Sending…" : "Send message"}
        {!pending && <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>}
      </button>
    </form>
  );
}
