import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-2xl font-bold tracking-tight">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Follow claims, register your own predictions, and build a public track
        record.
      </p>
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
