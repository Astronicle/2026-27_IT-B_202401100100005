import type { ReactNode } from "react";

export function TechLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] font-medium tracking-[0.22em] uppercase text-[var(--ink2)] ${className}`}>
      {children}
    </p>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-px w-full bg-[var(--line)] ${className}`} />;
}

export function Crosshair({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`font-mono text-[var(--blue)] select-none ${className}`}>
      +
    </span>
  );
}
