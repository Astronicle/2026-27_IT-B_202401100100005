"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Porygon } from "@/components/Porygon";
import { TechLabel } from "@/components/Tech";
import { api, useAuth } from "@/lib/api";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/transfer";
  const { refresh } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await api.login(email, password);
      else await api.register(email, password);
      await refresh();
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-12">
      <div className="md:col-span-5">
        <TechLabel>{"// ACCESS"}</TechLabel>
        <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
          ENTER
          <br />
          THE <span className="text-[var(--blue)]">FLUX.</span>
        </h1>
        <Porygon variant="blueprint" className="mt-8 w-full max-w-[300px]" />
        <p className="mt-6 font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">CONNECTION SECURE · AES-256</p>
      </div>
      <div className="md:col-span-6 md:col-start-7">
        <div className="border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex gap-px border-b border-[var(--line)] bg-[var(--line)]">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 py-3 font-mono text-xs tracking-[0.2em] ${
                  mode === m ? "bg-[var(--ink)] text-[var(--bg)]" : "bg-[var(--surface)] text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}
              >
                {m === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4 p-6 md:p-8">
            <div>
              <label htmlFor="email" className="font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">EMAIL</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@node.dev"
                className="mt-2 w-full border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm outline-none placeholder:text-[var(--ink2)]/50 focus:border-[var(--blue)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">PASSWORD</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm outline-none placeholder:text-[var(--ink2)]/50 focus:border-[var(--blue)]"
              />
            </div>
            {error && (
              <p role="alert" className="border border-[var(--err)] px-4 py-3 font-mono text-xs text-[var(--err)]">
                {error.toUpperCase()}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[var(--blue)] px-6 py-3.5 text-xs font-bold tracking-wide text-white transition-transform hover:-translate-y-px disabled:opacity-50"
            >
              {busy ? "WORKING…" : mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
            </button>
            <p className="text-center font-mono text-[10px] tracking-[0.18em] text-[var(--ink2)]">
              <Link href="/" className="hover:text-[var(--blue)]">← BACK TO HOME</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center px-5 py-16 md:px-8">
        <Suspense>
          <LoginInner />
        </Suspense>
      </main>
    </>
  );
}
