"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { UploadZone } from "@/components/UploadZone";
import { ProgressBar, StatusBadge } from "@/components/Bits";
import { ICopy, ICheck, IPause, IPlay, IX } from "@/components/Icons";
import { TechLabel } from "@/components/Tech";
import { api, useAuth, type PoryFile } from "@/lib/api";
import { formatBytes, formatETA, formatSpeed, transferId } from "@/lib/format";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const TABS = ["SEND", "RECEIVE", "LINK", "DEVICE"] as const;

interface Job {
  key: string;
  name: string;
  size: number;
  done: number;
  speed: number;
  status: "active" | "paused" | "done" | "error";
  error?: string;
  file?: PoryFile;
  tid: string;
  xhr?: XMLHttpRequest;
}

function useTransferPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const tab = (search.get("tab") ?? "send").toUpperCase();
  const active = (TABS as readonly string[]).includes(tab) ? tab : "SEND";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [files, setFiles] = useState<PoryFile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const jobsRef = useRef<Job[]>([]);
  jobsRef.current = jobs;

  const loadFiles = useCallback(async () => {
    if (!user) return;
    try {
      setFiles(await api.files());
    } catch {
      /* offline / unauthorized */
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/transfer");
  }, [loading, user, router]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const patch = (key: string, p: Partial<Job>) =>
    setJobs((js) => js.map((j) => (j.key === key ? { ...j, ...p } : j)));

  const upload = useCallback(
    (list: FileList | File[]) => {
      Array.from(list).forEach((f) => {
        const key = `${Date.now()}-${f.name}`;
        const tid = transferId();
        const job: Job = { key, name: f.name, size: f.size, done: 0, speed: 0, status: "active", tid };
        setJobs((js) => [job, ...js]);
        setSelected(key);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API}/files`);
        xhr.withCredentials = true;
        const t0 = Date.now();
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const secs = Math.max(0.2, (Date.now() - t0) / 1000);
          patch(key, { done: e.loaded, speed: e.loaded / secs });
        };
        xhr.onload = () => {
          if (xhr.status === 201) {
            try {
              const file = JSON.parse(xhr.responseText) as PoryFile;
              patch(key, { status: "done", done: f.size, speed: 0, file });
              void loadFiles();
            } catch {
              patch(key, { status: "error", error: "bad response" });
            }
          } else {
            patch(key, { status: "error", error: `upload failed (${xhr.status})` });
          }
        };
        xhr.onerror = () => patch(key, { status: "error", error: "network error" });
        const fd = new FormData();
        fd.append("file", f, f.name);
        patch(key, { xhr } as Partial<Job>);
        xhr.send(fd);
      });
    },
    [loadFiles],
  );

  const togglePause = (j: Job) => {
    if (j.status === "active") {
      j.xhr?.abort();
      patch(j.key, { status: "paused", speed: 0 });
    } else if (j.status === "paused" || j.status === "error") {
      patch(j.key, { status: "error", error: "resume re-uploads from start (prototype)" });
    }
  };

  const remove = (key: string) => {
    jobsRef.current.find((j) => j.key === key)?.xhr?.abort();
    setJobs((js) => js.filter((j) => j.key !== key));
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return { user, loading, active, jobs, files, selected, setSelected, copied, upload, togglePause, remove, copy, loadFiles };
}

function SendTab(p: ReturnType<typeof useTransferPage>) {
  const sel = p.jobs.find((j) => j.key === p.selected) ?? p.jobs[0];
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <UploadZone onFiles={p.upload} />
        <div className="mt-8">
          <TechLabel>ACTIVE TRANSFERS — {p.jobs.length}</TechLabel>
          <div className="mt-3 space-y-px border border-[var(--line)] bg-[var(--line)]">
            {p.jobs.length === 0 && (
              <p className="bg-[var(--bg)] px-5 py-8 text-center font-mono text-xs tracking-[0.18em] text-[var(--ink2)]">
                NO ACTIVE TRANSFERS
              </p>
            )}
            {p.jobs.map((j) => (
              <div
                key={j.key}
                onClick={() => p.setSelected(j.key)}
                className={`cursor-pointer bg-[var(--bg)] px-5 py-4 transition-colors ${p.selected === j.key ? "outline-1 outline-[var(--blue)] -outline-offset-1" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-bold">{j.name}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      aria-label={j.status === "active" ? "Pause" : "Resume"}
                      onClick={(e) => {
                        e.stopPropagation();
                        p.togglePause(j);
                      }}
                      className="flex h-7 w-7 items-center justify-center border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]"
                    >
                      {j.status === "active" ? <IPause className="h-3.5 w-3.5" /> : <IPlay className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      aria-label="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        p.remove(j.key);
                      }}
                      className="flex h-7 w-7 items-center justify-center border border-[var(--line)] hover:border-[var(--err)] hover:text-[var(--err)]"
                    >
                      <IX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-[var(--ink2)]">
                  {j.tid} · {formatBytes(j.done)} / {formatBytes(j.size)}
                  {j.status === "active" && ` · ${formatSpeed(j.speed)} · ${formatETA(j.size, j.done, j.speed)} LEFT`}
                  {j.status === "done" && " · COMPLETE"}
                  {j.status === "paused" && " · PAUSED"}
                  {j.error && ` · ${j.error.toUpperCase()}`}
                </p>
                <ProgressBar value={j.size ? (j.done / j.size) * 100 : 0} className="mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="border border-[var(--line)] bg-[var(--surface)]">
          <p className="border-b border-[var(--line)] px-5 py-3 font-mono text-[11px] tracking-[0.22em] text-[var(--ink2)]">
            TRANSFER DETAILS
          </p>
          {sel ? (
            <dl className="divide-y divide-[var(--line)] font-mono text-xs">
              {[
                ["STATUS", sel.status.toUpperCase()],
                ["FILE", sel.name],
                ["SIZE", formatBytes(sel.size)],
                ["TRANSFERRED", formatBytes(sel.done)],
                ["SPEED", sel.status === "active" ? formatSpeed(sel.speed) : "—"],
                ["TIME LEFT", sel.status === "active" ? formatETA(sel.size, sel.done, sel.speed) : "—"],
                ["ENCRYPTION", "AES-256"],
                ["TRANSFER ID", sel.tid],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-2.5">
                  <dt className="text-[var(--ink2)]">{k}</dt>
                  <dd className="truncate text-right">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="px-5 py-8 text-center font-mono text-xs tracking-[0.18em] text-[var(--ink2)]">SELECT A TRANSFER</p>
          )}
          {sel?.file && (
            <div className="border-t border-[var(--line)] p-5">
              <ShareButton
                file={sel.file}
                copied={p.copied}
                onCopy={(t) => p.copy(t)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShareButton({ file, copied, onCopy }: { file: PoryFile; copied: boolean; onCopy: (url: string) => void }) {
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      {!link ? (
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const s = await api.share(file.id);
              setLink(`${window.location.origin}/transfer?tab=receive#${s.token}`);
            } catch {
              /* show error inline */
            } finally {
              setBusy(false);
            }
          }}
          className="w-full bg-[var(--blue)] px-5 py-3 text-xs font-bold tracking-wide text-white transition-transform hover:-translate-y-px disabled:opacity-50"
        >
          {busy ? "CREATING…" : "COPY LINK"}
        </button>
      ) : (
        <button
          onClick={() => onCopy(link)}
          className="flex w-full items-center justify-center gap-2 border border-[var(--blue)] px-5 py-3 font-mono text-xs text-[var(--blue)]"
        >
          {copied ? <ICheck className="h-4 w-4" /> : <ICopy className="h-4 w-4" />}
          {copied ? "COPIED" : "COPY LINK"}
        </button>
      )}
      {link && <p className="mt-2 truncate font-mono text-[10px] text-[var(--ink2)]">{link}</p>}
    </div>
  );
}

function ReceiveTab() {
  const [token, setToken] = useState("");
  const clean = token.trim().split("#").pop()?.split("/").pop() ?? "";
  return (
    <div className="max-w-xl">
      <TechLabel>RECEIVE — VIA SHARE LINK</TechLabel>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink2)]">Paste a PoryFlux share link or token to download the file.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="https://…/transfer?tab=receive#TOKEN"
          spellCheck={false}
          className="flex-1 border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-sm outline-none placeholder:text-[var(--ink2)]/60 focus:border-[var(--blue)]"
        />
        <a
          href={clean ? api.shareUrl(clean) : undefined}
          aria-disabled={!clean}
          className={`px-6 py-3 text-center text-xs font-bold tracking-wide text-white ${clean ? "bg-[var(--blue)] hover:-translate-y-px" : "pointer-events-none bg-[var(--ink2)]/50"}`}
        >
          DOWNLOAD →
        </a>
      </div>
      <p className="mt-4 font-mono text-[10px] tracking-[0.18em] text-[var(--ink2)]">LINKS EXPIRE · REVOCABLE BY OWNER</p>
    </div>
  );
}

function LinkTab(p: ReturnType<typeof useTransferPage>) {
  const [links, setLinks] = useState<Record<string, string>>({});
  return (
    <div className="max-w-2xl">
      <TechLabel>LINK — SHARE YOUR FILES</TechLabel>
      <div className="mt-3 space-y-px border border-[var(--line)] bg-[var(--line)]">
        {p.files.length === 0 && (
          <p className="bg-[var(--bg)] px-5 py-8 text-center font-mono text-xs tracking-[0.18em] text-[var(--ink2)]">
            NO FILES YET — SEND ONE FIRST
          </p>
        )}
        {p.files.map((f) => (
          <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg)] px-5 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{f.filename}</p>
              <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--ink2)]">{formatBytes(f.size_bytes)}</p>
              {links[f.id] && <p className="mt-1 truncate font-mono text-[10px] text-[var(--blue)]">{links[f.id]}</p>}
            </div>
            <button
              onClick={async () => {
                const s = await api.share(f.id);
                const url = `${window.location.origin}/transfer?tab=receive#${s.token}`;
                setLinks((m) => ({ ...m, [f.id]: url }));
                p.copy(url);
              }}
              className="border border-[var(--blue)] px-4 py-2 font-mono text-[11px] text-[var(--blue)] hover:bg-[var(--blue)] hover:text-white"
            >
              {links[f.id] ? (p.copied ? "COPIED" : "COPY AGAIN") : "CREATE LINK"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceTab() {
  return (
    <div className="max-w-xl">
      <TechLabel>DEVICE — PAIRING (PROTOTYPE)</TechLabel>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink2)]">
        Direct device-to-device pairing is on the roadmap. Share links work across all your devices today.
      </p>
      <div className="mt-5 border border-[var(--line)] bg-[var(--surface)] px-5 py-4 font-mono text-xs">
        <p className="text-[var(--ink2)]">THIS DEVICE</p>
        <p className="mt-1">BROWSER · WEB · <span className="text-[var(--ok)]">ONLINE</span></p>
      </div>
    </div>
  );
}

function TransferInner() {
  const p = useTransferPage();
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">TRANSFER FILES</h1>
      <p className="mt-3 max-w-lg text-[var(--ink2)]">Send files securely across devices. Simple, fast and open.</p>
      {p.loading || !p.user ? (
        <div aria-label="Loading" className="mt-8 space-y-3">
          <div className="h-12 animate-pulse border border-[var(--line)] bg-[var(--surface)]" />
          <div className="h-64 animate-pulse border border-[var(--line)] bg-[var(--surface)]" />
        </div>
      ) : (
        <>
          <div className="mt-8 flex gap-px border border-[var(--line)] bg-[var(--line)]">
            {TABS.map((t) => (
              <Link
                key={t}
                href={`/transfer${t === "SEND" ? "" : `?tab=${t.toLowerCase()}`}`}
                className={`flex-1 px-4 py-3 text-center font-mono text-xs tracking-[0.2em] transition-colors ${
                  p.active === t ? "bg-[var(--ink)] text-[var(--bg)]" : "bg-[var(--bg)] text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
          <div className="mt-8">
            {p.active === "SEND" && <SendTab {...p} />}
            {p.active === "RECEIVE" && <ReceiveTab />}
            {p.active === "LINK" && <LinkTab {...p} />}
            {p.active === "DEVICE" && <DeviceTab />}
          </div>
        </>
      )}
    </div>
  );
}

export default function TransferPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-5 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Suspense>
            <TransferInner />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
