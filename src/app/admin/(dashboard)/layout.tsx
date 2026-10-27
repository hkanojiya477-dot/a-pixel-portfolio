import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-[0.08em]">
              A PIXEL <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
              <span className="ml-2 font-normal tracking-normal text-white/40">Admin</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/admin" className="text-white/70 hover:text-lime">Projects</Link>
              <Link href="/admin/messages" className="text-white/70 hover:text-lime">Messages</Link>
              <Link href="/" target="_blank" className="text-white/70 hover:text-lime">View site ↗</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/40 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:border-lime hover:text-lime">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">{children}</main>
    </>
  );
}
