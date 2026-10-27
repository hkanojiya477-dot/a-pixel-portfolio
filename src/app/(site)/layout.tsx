import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain relative min-h-screen">
      <a
        href="#main"
        className="sr-only z-[70] rounded bg-lime px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
