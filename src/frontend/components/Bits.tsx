export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full bg-[var(--line)] ${className}`} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-[var(--blue)] transition-[width] duration-300" style={{ width: `${v}%` }} />
    </div>
  );
}

const TONE: Record<string, string> = {
  active: "text-[var(--blue)] border-[var(--blue)]",
  ok: "text-[var(--ok)] border-[var(--ok)]",
  idle: "text-[var(--ink2)] border-[var(--line)]",
  err: "text-[var(--err)] border-[var(--err)]",
};

export function StatusBadge({ tone = "idle", children }: { tone?: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-[0.18em] ${TONE[tone]}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
