"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/browse", label: "Topics" },
  { href: "/resolving-soon", label: "Resolving Soon" },
  { href: "/notifications", label: "Notifications" },
  { href: "/methodology", label: "Methodology" },
];

export function MobileNav() {
  return (
    <div className="flex items-center gap-1 md:hidden">
      <Link
        href="/search"
        title="Search"
        className="flex rounded-md p-1.5 text-ink-2 hover:bg-accent hover:text-foreground"
      >
        <Search className="size-[19px]" strokeWidth={1.8} />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu"
          className="flex rounded-md p-1.5 text-ink-2 hover:bg-accent hover:text-foreground"
        >
          <Menu className="size-[19px]" strokeWidth={1.8} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {LINKS.map((l) => (
            <DropdownMenuItem key={l.href} asChild>
              <Link href={l.href}>{l.label}</Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/submit" className="font-medium">
              + Submit a claim
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
