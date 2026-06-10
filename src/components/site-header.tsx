import Link from "next/link";
import { Bell } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { AuthMenu } from "@/components/auth-menu";
import { BrandMark } from "@/components/brand-mark";
import { MobileNav } from "@/components/mobile-nav";

const NAV = [
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/browse", label: "Topics" },
  { href: "/resolving-soon", label: "Resolving Soon" },
  { href: "/methodology", label: "Methodology" },
];

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <BrandMark size={size === "lg" ? 26 : 23} />
      <span
        className={
          size === "lg"
            ? "font-serif text-xl font-semibold tracking-tight"
            : "font-serif text-[19px] font-semibold tracking-tight"
        }
      >
        SmartHumans
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-ink-2 transition-colors hover:bg-accent hover:text-foreground whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <SearchBar
            className="hidden sm:block w-full max-w-56"
            placeholder="Search figures…"
          />
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90 whitespace-nowrap"
          >
            <span className="font-mono">+</span> Submit
          </Link>
          <Link
            href="/notifications"
            title="Notifications"
            className="relative hidden md:flex rounded-md p-1.5 text-ink-2 hover:bg-accent hover:text-foreground"
          >
            <Bell className="size-[19px]" strokeWidth={1.8} />
            <span className="absolute top-1 right-1 size-[7px] rounded-full bg-st-false ring-[1.5px] ring-background" />
          </Link>
          <MobileNav />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
