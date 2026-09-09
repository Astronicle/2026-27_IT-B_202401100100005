"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IBurger, IX } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/api";

const LINKS = [
  { href: "/transfer", label: "TRANSFER" },
  { href: "/storage", label: "STORAGE" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const path = usePathname();

  // Always close the mobile menu on navigation so it never
  // lingers/flashes over the next page.
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Logged-out taps go straight to login (with a return address)
  // instead of bouncing through the app-page skeleton first.
  const appHref = (href: string) => (!loading && !user ? `/login?next=${href}` : href);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">PORYFLUX</span>
          <span className="hidden font-mono text-[10px] tracking-[0.2em] text-[var(--ink2)] sm:inline">
            // FILE TRANSFER SYSTEM
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={appHref(l.href)}
              className="px-4 py-2 font-mono text-xs tracking-[0.18em] text-[var(--ink2)] transition-colors hover:text-[var(--blue)]"
            >
              {l.label}
            </Link>
          ))}
          <span className="mx-2 hidden items-center gap-2 border border-[var(--line)] px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--ink2)] lg:flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
            SYSTEM READY
          </span>
          <ThemeToggle />
          {user ? (
            <Link
              href="/storage"
              className="ml-2 bg-[var(--ink)] px-5 py-2.5 text-xs font-bold tracking-wide text-[var(--bg)] transition-transform hover:-translate-y-px"
            >
              OPEN APP →
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-2 bg-[var(--blue)] px-5 py-2.5 text-xs font-bold tracking-wide text-white transition-transform hover:-translate-y-px"
            >
              GET STARTED →
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--ink)] transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)]"
          >
            {open ? <IX className="h-5 w-5" /> : <IBurger className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--line)] px-5 py-4 md:hidden">
          {[...LINKS, { href: user ? "/storage" : "/login", label: user ? "OPEN APP" : "GET STARTED" }].map((l) => (
            <Link
              key={l.href + l.label}
              href={appHref(l.href)}
              onClick={() => setOpen(false)}
              className="block border-b border-[var(--line)] py-3 font-mono text-sm tracking-[0.18em] last:border-0"
            >
              {l.label} →
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
