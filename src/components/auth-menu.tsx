"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUser } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { importAnonStances } from "@/app/actions";
import { clearAnonStakes, getAnonStakes } from "@/lib/anon-stakes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const migrated = useRef(false);

  // bring anonymous stakes home once the user signs in
  useEffect(() => {
    if (!session?.user || migrated.current) return;
    const list = Object.entries(getAnonStakes()).map(
      ([propositionId, position]) => ({
        propositionId: Number(propositionId),
        position,
      }),
    );
    if (list.length === 0) return;
    migrated.current = true;
    importAnonStances(list).then((res) => {
      if (res.ok) {
        clearAnonStakes();
        router.refresh();
      }
    });
  }, [session?.user, router]);

  if (isPending) {
    return <div className="size-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
      >
        Sign in
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border px-2 py-1 text-sm hover:bg-muted">
        <CircleUser className="size-4" />
        <span className="max-w-24 truncate">{session.user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Signed in as {session.user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">My scorecard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/u/${session.user.id}`}>Public profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.refresh();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
