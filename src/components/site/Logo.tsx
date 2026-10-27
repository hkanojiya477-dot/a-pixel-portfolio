import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="A PIXEL — home"
      className={`inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[0.08em] ${className}`}
    >
      <span>A PIXEL</span>
      <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
    </Link>
  );
}
