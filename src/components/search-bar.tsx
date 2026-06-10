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
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "left-3 size-5" : "left-3.5 size-[17px]",
        )}
      />
      <input
        name="q"
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "w-full rounded-full border outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground",
          size === "lg"
            ? "h-14 bg-background pl-11 pr-5 text-lg shadow-sm"
            : "h-10 bg-card pl-10 pr-4 text-[15px] shadow-xs",
        )}
      />
    </form>
  );
}
