import Link from "next/link";
import { Bell, Rss } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { AuthMenu } from "@/components/auth-menu";
import { BrandMark } from "@/components/brand-mark";
import { MobileNav } from "@/components/mobile-nav";

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
        <SearchBar
          className="hidden sm:block w-full max-w-lg"
          placeholder="Search anyone or any claim…"
        />
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90 whitespace-nowrap"
          >
            <span className="font-mono">+</span> Submit
          </Link>
          <Link
            href="/feed"
            title="Your feed — stakes and submissions from members you follow"
            className="hidden md:flex rounded-md p-1.5 text-ink-2 hover:bg-accent hover:text-foreground"
          >
            <Rss className="size-[19px]" strokeWidth={1.8} />
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
