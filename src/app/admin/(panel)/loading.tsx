/** Shown while admin data loads from Supabase. Mirrors the page rhythm so nothing jumps. */
export default function AdminLoading() {
  return (
    <div aria-busy="true">
      <span role="status" className="sr-only">
        Loading
      </span>
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-9 w-48 bg-line/70" />
        <div className="mt-3 h-4 w-72 bg-line/50" />
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-t border-line pt-4">
              <div className="h-3 w-24 bg-line/60" />
              <div className="mt-3 h-8 w-20 bg-line/70" />
            </div>
          ))}
        </div>
        <div className="mt-12 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-line/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
