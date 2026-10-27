import type { NextConfig } from "next";

// Allow Next.js to optimise images stored in your Supabase Storage bucket.
const remotePatterns: { protocol: "http" | "https"; hostname: string; pathname: string }[] = [
  { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { hostname, protocol } = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: protocol === "http:" ? "http" : "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // Invalid URL in .env.local — the site will show a "not configured" notice instead.
  }
}

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { remotePatterns },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
