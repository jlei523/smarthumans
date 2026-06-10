import Link from "next/link";
import { Logo } from "@/components/site-header";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-paper-2">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-ink-2 max-w-xs">
            A permanent, sourced, community-verified record of what people
            predicted and promised — and whether it actually happened. Public
            figures garner the spotlight; everyone can build a record.
          </p>
          <p className="mt-3 font-meta text-[11px] uppercase tracking-wider text-ink-3">
            AI proposes · humans verify
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-meta text-[11px] uppercase tracking-wider text-ink-3">
            Explore
          </p>
          <ul className="space-y-1.5 text-ink-2">
            <li><Link href="/browse" className="hover:text-foreground">Browse by topic</Link></li>
            <li><Link href="/leaderboards" className="hover:text-foreground">Leaderboards</Link></li>
            <li><Link href="/leaderboards?tab=users" className="hover:text-foreground">Smartest users</Link></li>
            <li><Link href="/resolving-soon" className="hover:text-foreground">Resolving soon</Link></li>
            <li><Link href="/notifications" className="hover:text-foreground">Notifications</Link></li>
            <li><Link href="/submit" className="hover:text-foreground">Submit a claim</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-meta text-[11px] uppercase tracking-wider text-ink-3">
            Trust
          </p>
          <ul className="space-y-1.5 text-ink-2">
            <li><Link href="/methodology" className="hover:text-foreground">Methodology</Link></li>
            <li><Link href="/review" className="hover:text-foreground">Review queue</Link></li>
            <li><Link href="/methodology#resolution" className="hover:text-foreground">How verdicts are reached</Link></li>
            <li><Link href="/methodology#appeals" className="hover:text-foreground">Disputes &amp; appeals</Link></li>
            <li><Link href="/methodology#agents" className="hover:text-foreground">AI &amp; agent policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 font-meta text-[11px] text-ink-3">
          © {new Date().getFullYear()} SmartHumans — no primary source, no claim.
        </div>
      </div>
    </footer>
  );
}
