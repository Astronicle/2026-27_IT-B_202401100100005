import Link from "next/link";
import { Porygon } from "./Porygon";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <Porygon variant="pixel" className="h-8 w-10" />
            <span className="text-xl font-bold tracking-tight">PORYFLUX</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--ink2)]">
            A modern, open file transfer system inspired by connection. Fast, secure and open for everyone.
          </p>
          <p className="mt-6 font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">DATA CONNECTS US.</p>
        </div>
        <div className="md:col-span-2 md:col-start-7">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">PRODUCT</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/transfer" className="hover:text-[var(--blue)]">Transfer</Link></li>
            <li><Link href="/storage" className="hover:text-[var(--blue)]">Storage</Link></li>
            <li><Link href="/login" className="hover:text-[var(--blue)]">Sign in</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">SYSTEM</p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-[var(--ink2)]">
            <li>ENCRYPTION AES-256</li>
            <li>PROTOCOL HTTPS</li>
            <li>NODE_07 ONLINE</li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">STATUS</p>
          <p className="mt-4 flex items-center gap-2 font-mono text-xs text-[var(--ink2)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ok)]" /> ALL SYSTEMS GO
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-4 font-mono text-[10px] tracking-[0.2em] text-[var(--ink2)] sm:flex-row md:px-8">
          <span>PORYFLUX © 2026</span>
          <span>MOVE DATA. NOT LIMITS.</span>
        </div>
      </div>
    </footer>
  );
}
