"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md rounded-3xl border border-white/10 bg-black/30 p-6 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          SKYNOTE
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-white/70">
          The app hit an unexpected issue. Try reloading the route and we’ll
          rebuild the dashboard state.
        </p>
        <Button className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
