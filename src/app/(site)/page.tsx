import Link from "next/link";
import EmptyState from "@/components/site/EmptyState";
import Marquee from "@/components/site/Marquee";
import ProjectGrid from "@/components/site/ProjectGrid";
import SectionLabel from "@/components/site/SectionLabel";
import { getPublishedProjects } from "@/lib/projects";
import { SERVICES } from "@/lib/services";
import { site } from "@/lib/site";

// Re-check the database at most once a minute (and instantly after you save in the admin).
export const revalidate = 60;

const PROCESS = [
  { title: "Discover", text: "We dig into your audience, market and goals to find the idea worth building." },
  { title: "Define", text: "Strategy, moodboards and direction — agreed before a single pixel is pushed." },
  { title: "Design", text: "Bold exploration, sharp refinement and motion that brings it all to life." },
  { title: "Deliver", text: "Production-ready files, launch assets and campaigns that keep performing." },
];

export default async function HomePage() {
  let projects = await getPublishedProjects({ featuredOnly: true, limit: 6 });
  if (projects.length === 0) projects = await getPublishedProjects({ limit: 6 });

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-12 pt-32 md:px-10 md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-lime/10 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:96px_96px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />

        <div className="relative mx-auto w-full max-w-[1600px]">
          <div className="mb-10 flex animate-rise flex-wrap items-center justify-between gap-4 md:mb-16">
            <SectionLabel>Creative Studio</SectionLabel>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{site.location}</p>
          </div>

          <h1 className="text-[15vw] font-semibold uppercase leading-[0.82] tracking-[-0.04em] sm:text-[13vw] lg:text-[11.5vw]">
            <span className="block animate-rise [animation-delay:100ms]">Bold ideas.</span>
            <span className="block animate-rise font-serif font-normal normal-case italic tracking-[-0.02em] text-lime [animation-delay:220ms]">
              pixel-perfect
            </span>
            <span className="block animate-rise [animation-delay:340ms]">execution.</span>
          </h1>

          <div className="mt-12 grid animate-rise gap-8 [animation-delay:500ms] md:mt-16 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
              {site.name} is a creative studio for design, branding, motion and performance
              advertising — crafting work that looks premium and moves the numbers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/work"
                className="group inline-flex items-center gap-3 rounded-full bg-lime px-7 py-4 font-medium text-ink"
              >
                View our work <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-white/20 px-7 py-4 font-medium transition-colors hover:border-lime hover:text-lime"
              >
                Start a project
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={SERVICES.map((s) => s.name)} />

      {/* SELECTED WORK */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <div className="mb-12 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="01">Selected work</SectionLabel>
            <h2 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Work that <span className="font-serif font-normal italic text-lime">speaks</span> first.
            </h2>
          </div>
          <Link href="/work" className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-lime">
            All projects <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {projects.length > 0 ? <ProjectGrid projects={projects} /> : <EmptyState />}
      </section>

      {/* SERVICES */}
      <section className="border-t border-white/10 bg-coal">
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
          <div className="mb-12 grid gap-8 md:mb-20 md:grid-cols-2 md:items-end">
            <div>
              <SectionLabel index="02">What we do</SectionLabel>
              <h2 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
                Nine disciplines.
                <br />
                <span className="font-serif font-normal italic text-lime">One vision.</span>
              </h2>
            </div>
            <p className="max-w-md text-white/60 md:justify-self-end">
              From the first sketch of a logo to the last frame of an ad campaign, every piece is
              designed to work together.
            </p>
          </div>

          <ul className="border-t border-white/10">
            {SERVICES.map((service, i) => (
              <li key={service.slug}>
                <Link
                  href={`/services#${service.slug}`}
                  className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-white/10 py-6 transition-colors hover:bg-white/[0.02] md:grid-cols-[5rem_1fr_1fr_auto] md:py-8"
                >
                  <span className="font-mono text-sm text-white/40 transition-colors group-hover:text-lime">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-2xl font-medium tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-4xl">
                    {service.name}
                  </span>
                  <span className="hidden text-sm text-white/50 md:block">{service.short}</span>
                  <span aria-hidden className="text-xl text-white/30 transition-all group-hover:rotate-45 group-hover:text-lime">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <SectionLabel index="03">How we work</SectionLabel>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step, i) => (
            <div key={step.title} className="flex min-h-[260px] flex-col justify-between bg-ink p-8">
              <span className="font-mono text-sm text-lime">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-3xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
