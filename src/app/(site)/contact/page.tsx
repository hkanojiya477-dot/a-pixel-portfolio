import type { Metadata } from "next";
import SectionLabel from "@/components/site/SectionLabel";
import { site } from "@/lib/site";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project with ${site.name}.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-[1600px] gap-16 px-5 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
      <div>
        <SectionLabel>Contact</SectionLabel>
        <h1 className="mt-6 text-5xl font-semibold uppercase leading-[0.85] tracking-[-0.04em] md:text-7xl">
          Let&apos;s
          <br />
          <span className="font-serif font-normal normal-case italic text-lime">talk.</span>
        </h1>
        <p className="mt-10 max-w-md text-lg leading-relaxed text-white/60">
          Tell us about your brand, your goals and your timeline. We usually reply within one to two
          working days.
        </p>

        <div className="mt-14 space-y-8 border-t border-white/10 pt-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Email</p>
            <a href={`mailto:${site.email}`} className="mt-2 block text-2xl hover:text-lime md:text-3xl">
              {site.email}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Social</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-lime">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ContactForm />
    </div>
  );
}
