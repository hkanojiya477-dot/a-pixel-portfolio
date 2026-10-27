export default function SectionLabel({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/50">
      <span className="h-1.5 w-1.5 bg-lime" aria-hidden />
      {index && <span className="font-mono text-lime">{index}</span>}
      {children}
    </p>
  );
}
