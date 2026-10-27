import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[0.08em]">
            A PIXEL <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
          </p>
          <h1 className="mt-6 text-2xl font-semibold">Admin sign in</h1>
        </div>

        {!isSupabaseConfigured && (
          <p className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            Supabase keys are missing. Create <code>.env.local</code> from <code>.env.example</code>, then restart{" "}
            <code>npm run dev</code>.
          </p>
        )}

        <div className="rounded-2xl border border-white/10 bg-coal p-6 md:p-8">
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-sm">
          <Link href="/" className="text-white/50 hover:text-lime">
            ← Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
