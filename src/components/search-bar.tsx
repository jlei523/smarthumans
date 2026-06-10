"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  size = "md",
  placeholder = "Search anyone or any claim…",
  className,
}: {
  size?: "md" | "lg";
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q")?.toString().trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "size-5" : "size-4",
        )}
      />
      <input
        name="q"
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "w-full rounded-full border bg-background outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground",
          size === "lg"
            ? "h-14 pl-11 pr-5 text-lg shadow-sm"
            : "h-9 pl-9 pr-4 text-sm",
        )}
      />
    </form>
  );
}
