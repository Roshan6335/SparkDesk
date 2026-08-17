import Link from "next/link";
import { Sparkles } from "lucide-react";

export function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-surface/40 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10">
            <Sparkles className="h-4 w-4 text-brand-400" />
          </div>
          <span className="font-display text-[17px] font-normal text-ink-900">SparkDesk</span>
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500 md:flex">
          <Link href="/workspace" className="transition-colors hover:text-ink-900">
            Workspace
          </Link>
          <Link href="/#tools" className="transition-colors hover:text-ink-900">
            Tools
          </Link>
          <Link href="/#about" className="transition-colors hover:text-ink-900">
            About
          </Link>
        </nav>
        <Link
          href="/workspace"
          className="rounded-lg bg-white px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-black shadow-card transition-transform hover:-translate-y-0.5"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
