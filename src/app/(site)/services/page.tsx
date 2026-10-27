import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/site/SectionLabel";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Graphic design, logo design, branding, social media, motion graphics, animation, video editing, packaging and Meta ads management.",
};

export default function ServicesPage() {
  return (
    <div className="pt-32 md:pt-44">
      <section className="mx-auto max-w-[1600px] px-5 md:px-10">
        <SectionLabel>Services</SectionLabel>
        <h1 className="mt-6 max-w-6xl text-6xl font-semibold uppercase leading-[0.85] tracking-[-0.04em] md:text-[8.5vw]">
          Everything your brand needs to{" "}
          <span className="font-serif font-normal normal-case italic text-lime">stand out.</span>
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-white/60">
          Hire us for a single deliverable or a complete launch. Every service plugs into the
          others, so your logo, feed, films and ads all feel like one brand.
        </p>

        <nav aria-label="Services" className="mt-12 flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-lime hover:text-lime"
            >
              {s.name}
            </a>
          ))}
        </nav>
      </section>

      <section className="mx-auto mt-20 max-w-[1600px] px-5 pb-24 md:mt-28 md:px-10 md:pb-36">
        {SERVICES.map((service, i) => (
          <div
            key={service.slug}
            id={service.slug}
            className="grid scroll-mt-28 gap-8 border-t border-white/10 py-14 md:grid-cols-[6rem_1.2fr_1fr] md:gap-12 md:py-20"
          >
            <span className="font-mono text-sm text-lime">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-4xl font-semibold leading-none tracking-tight md:text-6xl">{service.name}</h2>
              <p className="mt-6 font-serif text-2xl italic text-white/80">{service.short}</p>
              <p className="mt-6 max-w-xl leading-relaxed text-white/60">{service.description}</p>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <ul className="space-y-3">
                {service.deliverables.map((d) => (
                  <li key={d} className="flex items-center gap-3 border-b border-white/10 pb-3 text-white/80">
                    <span className="h-1.5 w-1.5 shrink-0 bg-lime" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/work?category=${service.slug}`}
                  className="rounded-full border border-white/20 px-5 py-3 text-sm hover:border-lime hover:text-lime"
                >
                  See {service.name.toLowerCase()} work →
                </Link>
                <Link href="/contact" className="rounded-full bg-lime px-5 py-3 text-sm font-medium text-ink">
                  Enquire
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
