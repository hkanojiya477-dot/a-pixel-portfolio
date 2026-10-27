import type { Metadata } from "next";
import Link from "next/link";
import SectionLabel from "@/components/site/SectionLabel";
import { SERVICES } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} — the creative studio behind bold brands, motion and campaigns.`,
};

// CHANGE ME: rewrite these in your own words.
const PRINCIPLES = [
  {
    title: "Every pixel has a job",
    text: "Nothing is decoration for its own sake. Each colour, frame and word is there to make your brand clearer, sharper and more memorable.",
  },
  {
    title: "Craft meets performance",
    text: "Beautiful work should also work. We design with real audiences, real platforms and real results in mind.",
  },
  {
    title: "Partners, not vendors",
    text: "We work closely with you from first call to final file — honest feedback, clear timelines, no surprises.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-32 md:pt-44">
      <section className="mx-auto max-w-[1600px] px-5 md:px-10">
        <SectionLabel>About the studio</SectionLabel>
        <h1 className="mt-6 max-w-6xl text-5xl font-semibold leading-[0.95] tracking-[-0.03em] md:text-8xl">
          We&apos;re {site.name} — a studio obsessed with the{" "}
          <span className="font-serif font-normal italic text-lime">details</span> that make brands unforgettable.
        </h1>
      </section>

      <section className="mx-auto mt-20 grid max-w-[1600px] gap-12 px-5 md:mt-32 md:grid-cols-2 md:px-10">
        <div className="space-y-6 text-lg leading-relaxed text-white/70">
          {/* CHANGE ME: your story */}
          <p>
            {site.name} started with a simple belief: great design is the fastest way for a brand to earn
            attention and trust. Today we help founders, creators and growing companies look as good as
            they really are.
          </p>
          <p>
            We bring strategy, design, motion and advertising under one roof — so the logo, the social
            feed, the launch film and the ads that drive sales all speak the same language.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-coal p-8 md:p-12">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Capabilities</h2>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s.slug} className="border-b border-white/10 py-3 text-white/80">
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <SectionLabel index="01">What we believe</SectionLabel>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="flex min-h-[300px] flex-col justify-between bg-ink p-8 md:p-10">
              <span className="font-mono text-sm text-lime">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-3xl font-semibold leading-tight tracking-tight">{p.title}</h3>
                <p className="mt-4 leading-relaxed text-white/60">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl font-serif text-3xl italic text-white/80 md:text-4xl">
            Curious what we could build together?
          </p>
          <div className="flex gap-3">
            <Link href="/work" className="rounded-full border border-white/20 px-6 py-3.5 hover:border-lime hover:text-lime">
              See the work
            </Link>
            <Link href="/contact" className="rounded-full bg-lime px-6 py-3.5 font-medium text-ink">
              Say hello
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
