"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 md:py-32">
      <h1 className="type-h1 max-w-[18ch] text-navy">This page didn&apos;t load.</h1>
      <p className="type-lead mt-6 max-w-[48ch]">
        Something went wrong on our side. Try again, and if it keeps happening, go back to the homepage.
      </p>
      {error.digest && <p className="mt-4 text-xs text-muted">Error reference: {error.digest}</p>}
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className="link-underline text-navy">
          Go to the homepage
        </Link>
      </div>
    </Container>
  );
}
