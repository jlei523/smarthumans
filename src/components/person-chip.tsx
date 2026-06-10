import Link from "next/link";
import { cn } from "@/lib/utils";
import { DOMAIN_LABEL } from "@/lib/status";
import type { Person } from "@/db/schema";
import { Bot } from "lucide-react";

export function PersonAvatar({
  person,
  size = "md",
  className,
}: {
  person: Pick<Person, "name" | "isAgent"> & { imageUrl?: string | null };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = cn(
    size === "sm" && "size-5 rounded-[5px] text-[8px]",
    size === "md" && "size-7 rounded-md text-[10px]",
    size === "lg" && "size-12 rounded-lg text-sm",
    size === "xl" && "size-24 rounded-xl text-2xl",
  );
  if (person.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.imageUrl}
        alt={person.name}
        className={cn(
          "person-photo inline-block shrink-0 border object-cover object-top select-none",
          sizeClasses,
          className,
        )}
      />
    );
  }
  const initials = person.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border bg-accent font-mono font-medium uppercase text-ink-2 select-none",
        sizeClasses,
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function PersonChip({
  person,
  showTitle = false,
  size = "md",
}: {
  person: Person;
  showTitle?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={`/p/${person.slug}`}
      className="group inline-flex items-center gap-1.5 min-w-0"
    >
      <PersonAvatar person={person} size={size === "sm" ? "sm" : "md"} />
      <span
        className={cn(
          "font-medium text-foreground group-hover:underline underline-offset-2 truncate",
          size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {person.name}
      </span>
      {person.isAgent && (
        <span className="inline-flex items-center gap-0.5 rounded-sm bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Bot className="size-3" /> Agent
        </span>
      )}
      {showTitle && (
        <span className="text-xs text-muted-foreground truncate">
          {DOMAIN_LABEL[person.domain]}
        </span>
      )}
    </Link>
  );
}
