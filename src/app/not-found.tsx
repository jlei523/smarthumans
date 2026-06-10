import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <BrandMark size={32} className="text-ink-3" />
      <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight">
        Not on the record
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page doesn&apos;t exist — or the claim you&apos;re looking for
        hasn&apos;t been tracked yet.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Back to home
        </Link>
        <Link
          href="/submit"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Submit a claim
        </Link>
      </div>
    </div>
  );
}
