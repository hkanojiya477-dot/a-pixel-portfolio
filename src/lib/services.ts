// Your services. These also act as the project categories in the admin dashboard.
// You can edit the descriptions freely. If you change a "slug", projects that
// used the old slug will need their category re-selected.

export interface Service {
  slug: string;
  name: string;
  short: string;
  description: string;
  deliverables: string[];
}

export const SERVICES: Service[] = [
  {
    slug: "graphic-design",
    name: "Graphic Design",
    short: "Visual systems that make every touchpoint feel intentional.",
    description:
      "From posters to pitch decks, we design visuals with a clear hierarchy, sharp typography and a point of view — work that communicates in a single glance.",
    deliverables: ["Posters & print", "Pitch decks", "Editorial layouts", "Campaign key visuals"],
  },
  {
    slug: "logo-design",
    name: "Logo Design",
    short: "Marks built to be remembered — and to scale from favicon to billboard.",
    description:
      "We explore, refine and stress-test logos until they hold up everywhere: tiny app icons, giant signage, one colour or full colour.",
    deliverables: ["Logomarks & wordmarks", "Monograms", "Responsive logo sets", "Usage rules"],
  },
  {
    slug: "branding",
    name: "Branding",
    short: "Complete identities with strategy, voice and visual language.",
    description:
      "A brand is more than a logo. We define how you look, sound and behave — then package it into a system your whole team can use.",
    deliverables: ["Brand strategy", "Visual identity", "Brand guidelines", "Tone of voice"],
  },
  {
    slug: "social-media-design",
    name: "Social Media Design",
    short: "Scroll-stopping content designed for the feed.",
    description:
      "Templates, carousels and campaign content built for consistency and engagement, so your feed looks like a brand — not a collage.",
    deliverables: ["Post & carousel design", "Story templates", "Content systems", "Campaign assets"],
  },
  {
    slug: "motion-graphics",
    name: "Motion Graphics",
    short: "Typography and graphics that move with purpose.",
    description:
      "We bring brand systems to life with kinetic type, animated logos and explainer graphics that hold attention in the first second.",
    deliverables: ["Logo animation", "Kinetic typography", "Explainers", "Animated ads"],
  },
  {
    slug: "animation",
    name: "Animation",
    short: "2D and character-led animation with personality.",
    description:
      "Frame-by-frame charm or smooth vector motion — we craft animated stories, loops and characters that people want to watch twice.",
    deliverables: ["2D animation", "Character animation", "Looping animations", "Animated illustrations"],
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    short: "Edits with rhythm, pace and a cinematic finish.",
    description:
      "From raw footage to a finished film: cutting, colour, sound design and captions for reels, brand films, ads and YouTube.",
    deliverables: ["Reels & shorts", "Brand films", "Colour grading", "Sound design & captions"],
  },
  {
    slug: "packaging-design",
    name: "Packaging Design",
    short: "Packaging that wins the shelf and the unboxing.",
    description:
      "Structure, graphics and print-ready files for products that need to stand out in-store and on screen.",
    deliverables: ["Label & box design", "Product mockups", "Print-ready artwork", "Packaging systems"],
  },
  {
    slug: "meta-ads",
    name: "Meta Ads Management",
    short: "Creative-led Facebook & Instagram campaigns that perform.",
    description:
      "We plan, design, launch and optimise Meta ad campaigns — pairing strong creative with testing and reporting so every rupee and dollar works harder.",
    deliverables: ["Campaign strategy", "Ad creatives", "Audience testing", "Performance reporting"],
  },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function serviceName(slug: string): string {
  return getService(slug)?.name ?? slug;
}
