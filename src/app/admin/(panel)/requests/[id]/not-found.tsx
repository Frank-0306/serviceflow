import Link from "next/link";

export default function RequestNotFound() {
  return (
    <div className="max-w-xl py-10">
      <h1 className="type-h2 text-navy">Request not found</h1>
      <p className="mt-3 leading-relaxed text-muted">
        The link may be wrong, or the request was removed from the database. Go back to the list and search by name or reference.
      </p>
      <Link href="/admin/requests" className="link-underline mt-6 inline-block text-navy">
        Back to requests
      </Link>
    </div>
  );
}
