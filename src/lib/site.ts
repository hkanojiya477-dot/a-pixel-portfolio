// =====================================================================
// YOUR BRAND DETAILS — edit the text in this file to update the website.
// Anything marked "CHANGE ME" is a placeholder.
// =====================================================================

export const site = {
  name: "A PIXEL",
  tagline: "Creative studio for brands that refuse to blend in.",
  description:
    "A PIXEL is a creative studio crafting graphic design, branding, motion, video and performance ads for ambitious brands.",
  email: "hello@example.com", // CHANGE ME — your real email address
  location: "Working worldwide", // CHANGE ME (e.g. "Mumbai, India")
  socials: [
    { label: "Instagram", href: "https://instagram.com/" }, // CHANGE ME
    { label: "Behance", href: "https://behance.net/" }, // CHANGE ME
    { label: "LinkedIn", href: "https://linkedin.com/" }, // CHANGE ME
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const navLinks = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
