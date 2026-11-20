import { Container } from "@/components/ui/Container";

/** Route-level loading state: quiet skeleton in the page's own rhythm. */
export default function Loading() {
  return (
    <Container className="py-20">
      <div aria-busy="true">
      <span className="sr-only" role="status">
        Loading page
      </span>
      <div aria-hidden="true" className="animate-pulse space-y-6">
        <div className="h-14 w-2/3 max-w-xl bg-line/70" />
        <div className="h-4 w-full max-w-lg bg-line/60" />
        <div className="h-4 w-5/6 max-w-md bg-line/60" />
        <div className="mt-12 h-64 w-full bg-line/40" />
      </div>
      </div>
    </Container>
  );
}
