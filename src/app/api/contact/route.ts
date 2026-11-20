import { NextResponse } from "next/server";
import { contactMessageSchema, toFieldErrors } from "@/lib/validation";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10_000;

/**
 * POST /api/contact
 * Phase 1: validates the message and acknowledges it. Nothing is stored or emailed.
 * Phase 2: persist to Supabase and/or send through an email provider.
 */
export async function POST(request: Request) {
  const limited = rateLimit(`contact:${clientKey(request)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many messages from this connection. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "The message is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const honeypot = (body as { company?: unknown })?.company;
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Some fields need attention.", fieldErrors: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
