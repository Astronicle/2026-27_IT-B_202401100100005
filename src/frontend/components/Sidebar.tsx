"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { IDevices, IDownload, IFolder, IShare, IUser } from "./Icons";
import { Porygon } from "./Porygon";
import { ThemeToggle } from "./ThemeToggle";

const ITEMS = [
  { href: "/transfer", label: "Transfer", Icon: IDownload, tab: null as string | null },
  { href: "/storage", label: "Storage", Icon: IFolder, tab: null },
  { href: "/storage?tab=shared", label: "Shared", Icon: IShare, tab: "shared" },
  { href: "/transfer?tab=device", label: "Devices", Icon: IDevices, tab: "device" },
  { href: "/login", label: "Account", Icon: IUser, tab: null },
];

export function Sidebar() {
  return (
    <Suspense>
      <SidebarInner />
    </Suspense>
  );
}

function SidebarInner() {
  const path = usePathname();
  const search = useSearchParams();
  const tab = search.get("tab");
  return (
    <aside className="flex w-full flex-col border-[var(--line)] bg-[var(--surface)] md:h-screen md:w-60 md:shrink-0 md:border-r lg:sticky lg:top-0">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <Link href="/" className="text-base font-bold tracking-tight">
          PORYFLUX
        </Link>
        <ThemeToggle />
      </div>
      <nav className="flex flex-row gap-1 overflow-x-auto p-3 md:flex-col">
        {ITEMS.map(({ href, label, Icon, tab: want }) => {
          const base = href.split("?")[0];
          const isActive = want ? path === base && tab === want : path === base && tab !== "shared" && tab !== "device";
          return (
            <Link
              key={label + href}
              href={href}
              className={`flex shrink-0 items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-[0.16em] transition-colors ${
                isActive
                  ? "bg-[var(--ink)] text-[var(--bg)]"
                  : "text-[var(--ink2)] hover:bg-[var(--elev)] hover:text-[var(--ink)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label.toUpperCase()}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-[var(--line)] p-5 md:block">
        <div className="flex items-end justify-between">
          <Porygon variant="pixel" className="h-10 w-12" />
          <p className="font-mono text-[10px] leading-relaxed tracking-[0.18em] text-[var(--ink2)]">
            STORE
            <br />
            SHARE
            <br />
            ACCESS
          </p>
        </div>
        <p className="mt-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[var(--ink2)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
          CONNECTION SECURE
        </p>
      </div>
    </aside>
  );
}
