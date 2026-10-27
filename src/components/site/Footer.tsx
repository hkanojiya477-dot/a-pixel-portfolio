import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { navLinks, site } from "@/lib/site";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto max-w-[1600px] px-5 pt-20 md:px-10 md:pt-28">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-16 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Let&apos;s make something <span className="font-serif font-normal italic text-lime">unforgettable.</span>
          </h2>
          <Link
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-lime px-7 py-4 font-medium text-ink md:self-auto"
          >
            Start a project
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-white/50">{site.tagline}</p>
          </div>

          <div>
            <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-white/40">Navigate</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-white/70 hover:text-lime">Home</Link></li>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 hover:text-lime">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-white/40">Services</h3>
            <ul className="space-y-3 text-sm">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/work?category=${s.slug}`} className="text-white/70 hover:text-lime">{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-white/40">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li><a href={`mailto:${site.email}`} className="text-white hover:text-lime">{site.email}</a></li>
              <li className="text-white/50">{site.location}</li>
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-lime">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-8 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Designed with intent. Built pixel by pixel.</p>
        </div>
      </div>
    </footer>
  );
}
