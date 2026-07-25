import Link from "next/link";
import { Sparkles } from "lucide-react";

export function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-[17px] font-bold text-ink-900">SparkDesk</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-700 md:flex">
          <Link href="/workspace" className="hover:text-brand-600">
            Workspace
          </Link>
          <Link href="/#tools" className="hover:text-brand-600">
            Tools
          </Link>
          <Link href="/#about" className="hover:text-brand-600">
            About
          </Link>
        </nav>
        <Link
          href="/workspace"
          className="rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          Open Workspace
        </Link>
      </div>
    </header>
  );
}
