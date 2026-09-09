import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Porygon } from "@/components/Porygon";
import { ProgressBar, StatusBadge } from "@/components/Bits";
import { IArrow } from "@/components/Icons";
import { Crosshair, Rule, TechLabel } from "@/components/Tech";

function Stats() {
  const items: Array<[string, string]> = [
    ["1M+", "FILES TRANSFERRED"],
    ["10K+", "USERS"],
    ["99.9%", "UPTIME"],
    ["AES-256", "ENCRYPTION"],
  ];
  return (
    <section aria-label="System statistics" className="border-y border-[var(--line)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {items.map(([n, l], i) => (
          <div key={l} className={`px-5 py-8 md:px-8 ${i !== 0 ? "border-l border-[var(--line)]" : ""} ${i >= 2 ? "max-md:border-t max-md:border-[var(--line)]" : ""} ${i === 2 ? "max-md:border-l-0" : ""}`}>
            <p className="text-4xl font-bold tracking-tight md:text-5xl">{n}</p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const rows = [
    {
      n: "01",
      title: "TRANSFER ANYTHING",
      body: "Move files quickly and intuitively across devices. Drop, send, done — PoryFlux handles sizing, chunking and resume so large transfers just work.",
      meta: ["PROTOCOL HTTPS", "RESUME SUPPORT", "500MB / FILE"],
      visual: (
        <div className="dotgrid relative border border-[var(--line)] bg-[var(--surface)] p-8">
          <Crosshair className="absolute top-2 left-3" />
          <Crosshair className="absolute right-3 bottom-2" />
          <Porygon variant="wireframe" className="anim-float mx-auto h-44" />
          <p className="mt-4 text-center font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">FIG.01 — GEOMETRY</p>
        </div>
      ),
    },
    {
      n: "02",
      title: "END-TO-END SECURE",
      body: "Every file is encrypted at rest with AES-256 before it touches disk, and share links are unguessable tokens that are hashed in storage — never kept raw.",
      meta: ["AES-256 AT REST", "HASHED SHARE TOKENS", "EXPIRY + REVOCATION"],
      visual: (
        <div className="relative border border-[var(--line)] bg-[var(--surface)] p-8">
          <div className="flex items-center justify-between">
            <TechLabel>ENCRYPTION</TechLabel>
            <StatusBadge tone="ok">ACTIVE</StatusBadge>
          </div>
          <p className="mt-6 font-mono text-sm break-all text-[var(--ink2)]">SHA256&nbsp;&nbsp;7f3a…91c2</p>
          <p className="mt-1 font-mono text-sm break-all text-[var(--ink2)]">ALG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AES-256-CTR</p>
          <ProgressBar value={100} className="mt-6" />
          <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">SEALED — 256 BIT</p>
        </div>
      ),
    },
    {
      n: "03",
      title: "OPEN BY DESIGN",
      body: "PoryFlux is built in the open with boring, auditable pieces: Postgres, Go, Next.js. No lock-in, no black boxes — run the whole stack with one compose file.",
      meta: ["OPEN STACK", "ONE-COMMAND DEPLOY", "SELF-HOSTABLE"],
      visual: (
        <div className="relative border border-[var(--line)] bg-[var(--surface)] p-8">
          <Porygon variant="pixel" className="mx-auto h-28" />
          <p className="mt-4 text-center font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">OPEN — FOREVER</p>
        </div>
      ),
    },
  ];
  return (
    <section id="features" aria-label="Features" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <TechLabel>// CAPABILITIES</TechLabel>
      <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
        A system, not a dashboard.
      </h2>
      <div className="mt-16 space-y-20 md:space-y-28">
        {rows.map((r, i) => (
          <article key={r.n} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
            <div className={`md:col-span-6 ${i % 2 ? "md:order-2" : ""}`}>
              <p className="font-mono text-sm text-[var(--blue)]">{r.n}</p>
              <h3 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{r.title}</h3>
              <p className="mt-5 max-w-md leading-relaxed text-[var(--ink2)]">{r.body}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {r.meta.map((m) => (
                  <li key={m} className="border border-[var(--line)] px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[var(--ink2)]">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>{r.visual}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TransferVisual() {
  return (
    <section aria-label="Transfer preview" className="border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <TechLabel>// LIVE TRANSFER</TechLabel>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Watch it
            <br />
            move.
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-[var(--ink2)]">
            Real progress, real speed, real time-remaining. The transfer card is the interface — no mystery spinners.
          </p>
          <Link
            href="/transfer"
            className="mt-8 inline-flex items-center gap-3 bg-[var(--ink)] px-6 py-3 text-xs font-bold tracking-wide text-[var(--bg)] transition-transform hover:-translate-y-px"
          >
            TRY A TRANSFER <IArrow className="h-4 w-4" />
          </Link>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <div className="anim-float border border-[var(--line)] bg-[var(--elev)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
              <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--ink2)]">TRANSFER_ID&nbsp;&nbsp;7F3A-91C2</p>
              <StatusBadge tone="active">ACTIVE</StatusBadge>
            </div>
            <div className="px-5 py-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-2xl font-bold tracking-tight">project.zip</p>
                <p className="font-mono text-xs text-[var(--ink2)]">2.48 GB</p>
              </div>
              <div className="mt-5 flex items-baseline justify-between font-mono text-xs">
                <span className="text-[var(--blue)]">72%</span>
                <span className="text-[var(--ink2)]">12.4 MB/s · 00:01:32 left</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-[var(--line)]">
                <div className="h-full bg-[var(--blue)]" style={{ animation: "px-progress 2.2s ease-out forwards" }} />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-px border border-[var(--line)] bg-[var(--line)] font-mono text-[10px] tracking-[0.16em]">
                {[
                  ["ENCRYPTION", "AES-256"],
                  ["PROTOCOL", "HTTPS"],
                  ["NODE", "NODE_07"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-[var(--elev)] px-3 py-2.5">
                    <p className="text-[var(--ink2)]">{k}</p>
                    <p className="mt-1 text-[var(--ink)]">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GlobeSection() {
  return (
    <section aria-label="Global network" className="bg-[#0D0F12] text-[#F3F4F1]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
        <div className="relative order-2 md:order-1 md:col-span-7">
          <div aria-hidden className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3C8DFF]/25 blur-3xl" />
          <div className="anim-spin-slow absolute inset-6 rounded-full border border-dashed border-[#4A9BFF]/30" aria-hidden />
          <Image
            src="/globe.svg"
            alt="Global network"
            width={560}
            height={560}
            className="relative mx-auto w-full max-w-[520px] opacity-90 invert"
          />
          <span className="anim-blink absolute top-[22%] left-[30%] h-2 w-2 rounded-full bg-[#00D9FF]" aria-hidden />
          <span className="anim-blink absolute top-[58%] left-[64%] h-2 w-2 rounded-full bg-[#4A9BFF]" style={{ animationDelay: "0.5s" }} aria-hidden />
          <span className="anim-blink absolute top-[38%] left-[74%] h-1.5 w-1.5 rounded-full bg-[#806BFF]" style={{ animationDelay: "1s" }} aria-hidden />
          <p className="relative mt-2 text-center font-mono text-[10px] tracking-[0.22em] text-[#9A9EA5]">
            51.5072°N — 0.1276°W · NODE_07 · <span className="text-[#00D9FF]">LINKED</span>
          </p>
        </div>
        <div className="order-1 md:order-2 md:col-span-5">
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#9A9EA5]">{"// GLOBAL"}</p>
          <h2 className="mt-4 text-4xl leading-[1.02] font-bold tracking-tight md:text-6xl">
            DATA
            <br />
            CONNECTS
            <br />
            <span className="text-[#4A9BFF]">US.</span>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-[#9A9EA5]">
            Connecting people through data. A more open internet — every transfer a small act of connection.
          </p>
          <div className="mt-8 flex gap-px border border-[#2B3037] bg-[#2B3037] font-mono text-[10px] tracking-[0.18em]">
            {["TRANSFER", "SHARE", "CONNECT"].map((t) => (
              <span key={t} className="flex-1 bg-[#0D0F12] px-3 py-2.5 text-center text-[#9A9EA5]">
                {"// "}{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PorygonSystem() {
  const cells: Array<{ v: "solid" | "wireframe" | "pixel" | "blueprint"; t: string; d: string }> = [
    { v: "solid", t: "PRIMARY", d: "Clean geometric Porygon. The face of the system." },
    { v: "wireframe", t: "WIREFRAME", d: "Technical construction view for diagrams." },
    { v: "pixel", t: "PIXEL", d: "Small playful moments. Favicons, empty states." },
    { v: "blueprint", t: "BLUEPRINT", d: "Schematics, docs and construction lines." },
  ];
  return (
    <section aria-label="Porygon system" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <TechLabel>{"// IDENTITY"}</TechLabel>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">One bird, four modes.</h2>
        </div>
        <p className="max-w-xs font-mono text-[11px] leading-relaxed tracking-[0.14em] text-[var(--ink2)]">
          PORYGON // 137 — SMALL DOSES. NEVER A MASCOT CARPET.
        </p>
      </div>
      <div className="mt-12 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        {cells.map((c) => (
          <div key={c.t} className="group bg-[var(--bg)] p-6 transition-colors hover:bg-[var(--surface)]">
            <div className="dotgrid flex h-48 items-center justify-center border border-[var(--line)]">
              <Porygon variant={c.v} className="h-36 transition-transform duration-300 group-hover:-translate-y-1" />
            </div>
            <p className="mt-4 font-mono text-[11px] tracking-[0.22em] text-[var(--blue)]">{c.t}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink2)]">{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* ——— HERO ——— */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 bg-[var(--hero-wash)] max-md:hidden" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pt-16 pb-20 md:grid-cols-12 md:px-8 md:pt-24 md:pb-28">
            <div className="md:col-span-7">
              <p className="inline-block border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[11px] tracking-[0.22em] text-[var(--ink2)]">
                FILE TRANSFER SYSTEM
              </p>
              <h1 className="mt-6 text-[17vw] leading-[0.92] font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-[7.5rem]">
                MOVE
                <br />
                DATA.
                <br />
                <span className="text-[var(--blue)]">NOT LIMITS.</span>
              </h1>
              <p className="mt-7 max-w-md leading-relaxed text-[var(--ink2)]">
                PoryFlux is a modern, open file transfer system inspired by connection. Fast, secure and open for
                everyone.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 bg-[var(--blue)] px-7 py-3.5 text-xs font-bold tracking-wide text-white transition-transform hover:-translate-y-px"
                >
                  GET STARTED
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-3 border border-[var(--line)] px-7 py-3.5 text-xs font-bold tracking-wide transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)]"
                >
                  LEARN MORE
                </Link>
              </div>
              <p className="mt-8 font-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
                CONNECTION SECURE · NODE ONLINE
              </p>
            </div>

            <div className="relative md:col-span-5">
              <div className="dotgrid relative border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
                <Crosshair className="absolute top-2 left-3" />
                <Crosshair className="absolute top-2 right-3" />
                <Crosshair className="absolute bottom-2 left-3" />
                <Crosshair className="absolute right-3 bottom-2" />
                <div aria-hidden className="absolute inset-8 rounded-full border border-dashed border-[var(--blue)] opacity-40 max-md:hidden" />
                <Porygon variant="solid" className="anim-float relative mx-auto w-full max-w-[340px]" />
                <span aria-hidden className="anim-drift absolute top-[18%] left-[12%] h-2 w-2 bg-[var(--blue)]" />
                <span aria-hidden className="anim-drift absolute right-[14%] bottom-[26%] h-1.5 w-1.5 bg-[var(--cyan)]" style={{ animationDelay: "1.2s" }} />
                <span aria-hidden className="anim-drift absolute top-[52%] right-[8%] h-2 w-2 bg-[var(--purple)]" style={{ animationDelay: "2.1s" }} />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[var(--ink2)]">
                <span>PORYGON // 137</span>
                <span className="text-[var(--blue)]">DATA CONNECTS US.</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-px border border-[var(--line)] bg-[var(--line)] font-mono text-[10px] tracking-[0.16em]">
                {["TRANSFER", "SHARE", "CONNECT", "FREELY"].map((t) => (
                  <span key={t} className="bg-[var(--surface)] px-2 py-2 text-center text-[var(--ink2)]">
                    {"// "}{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Rule />
        </section>

        <Stats />
        <Features />
        <TransferVisual />
        <GlobeSection />
        <PorygonSystem />

        {/* ——— CTA ——— */}
        <section className="border-t border-[var(--line)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
            <h2 className="text-4xl font-bold tracking-tight md:col-span-8 md:text-7xl">
              START MOVING
              <br />
              <span className="text-[var(--blue)]">DATA TODAY.</span>
            </h2>
            <div className="flex flex-col justify-end gap-3 md:col-span-4">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-3 bg-[var(--blue)] px-7 py-3.5 text-xs font-bold tracking-wide text-white transition-transform hover:-translate-y-px"
              >
                GET STARTED
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <p className="text-center font-mono text-[10px] tracking-[0.2em] text-[var(--ink2)]">FREE · OPEN · SECURE</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
