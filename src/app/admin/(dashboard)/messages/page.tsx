import { requireAdmin } from "@/lib/auth";
import { serviceName } from "@/lib/services";
import type { ContactMessage } from "@/lib/types";
import { deleteMessage } from "../../actions";

export default async function MessagesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const messages = (data ?? []) as ContactMessage[];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
      <p className="mt-1 text-sm text-white/50">Enquiries sent from your Contact page.</p>

      {error && (
        <p className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Could not load messages: {error.message}
        </p>
      )}

      {messages.length === 0 && !error ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-white/50">
          No messages yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="rounded-2xl border border-white/10 bg-coal p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-sm text-lime hover:underline">
                    {m.email}
                  </a>
                </div>
                <p className="text-xs text-white/40">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              {(m.service || m.budget) && (
                <p className="mt-3 flex flex-wrap gap-2 text-xs">
                  {m.service && <span className="rounded-full bg-white/10 px-2.5 py-1">{serviceName(m.service)}</span>}
                  {m.budget && <span className="rounded-full bg-white/10 px-2.5 py-1 capitalize">{m.budget}</span>}
                </p>
              )}
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/80">{m.message}</p>
              <div className="mt-5 flex gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your enquiry to A PIXEL")}`}
                  className="rounded-lg bg-lime px-3 py-1.5 text-xs font-medium text-ink"
                >
                  Reply by email
                </a>
                <form action={deleteMessage.bind(null, m.id)}>
                  <button type="submit" className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
