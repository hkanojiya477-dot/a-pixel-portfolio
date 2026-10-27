import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function EmptyState({ message = "New work is on the way." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-6 py-20 text-center">
      <p className="font-serif text-3xl italic text-white/80 md:text-4xl">{message}</p>
      <p className="mx-auto mt-4 max-w-md text-sm text-white/50">
        {isSupabaseConfigured
          ? "Check back soon — or get in touch to see more of our portfolio."
          : "Setup note: Supabase keys are missing. Add them to .env.local (see README) to load projects."}
      </p>
      <Link href="/contact" className="mt-8 inline-block text-sm text-lime underline-offset-4 hover:underline">
        Get in touch →
      </Link>
    </div>
  );
}
