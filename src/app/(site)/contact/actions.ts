"use server";

import { SERVICE_SLUGS } from "@/lib/services";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export type ContactValues = { name: string; email: string; service: string; budget: string; message: string };
export type ContactState = { ok?: boolean; error?: string; values?: ContactValues };

const BUDGETS = ["small", "medium", "large", "retainer", "unsure"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Hidden "honeypot" field: real people never fill it in, spam bots usually do.
  if (String(formData.get("website") ?? "").length > 0) return { ok: true };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // Sent back on errors so the visitor doesn't lose what they typed.
  const values: ContactValues = { name, email, service, budget, message };
  const fail = (error: string): ContactState => ({ error, values });

  if (!name || name.length > 100) return fail("Please enter your name.");
  if (!EMAIL.test(email) || email.length > 200) return fail("Please enter a valid email address.");
  if (message.length < 10) return fail("Please tell us a little more (at least 10 characters).");
  if (message.length > 5000) return fail("Your message is too long (max 5,000 characters).");

  if (!isSupabaseConfigured) {
    return fail("The contact form isn't connected yet. Please email us directly.");
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    service: SERVICE_SLUGS.includes(service) ? service : null,
    budget: BUDGETS.includes(budget) ? budget : null,
    message,
  });

  if (error) {
    console.error("[contact] Could not save message:", error.message);
    return fail("Something went wrong sending your message. Please email us directly.");
  }

  return { ok: true };
}
