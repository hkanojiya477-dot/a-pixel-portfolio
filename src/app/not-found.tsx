import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="font-mono text-sm text-lime">404</p>
        <h1 className="mt-4 text-6xl font-semibold tracking-tight md:text-8xl">
          Lost a <span className="font-serif font-normal italic text-lime">pixel.</span>
        </h1>
        <p className="mt-6 text-white/60">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="mt-10 inline-block rounded-full bg-lime px-7 py-4 font-medium text-ink">
          Back to home
        </Link>
      </div>
    </main>
  );
}
