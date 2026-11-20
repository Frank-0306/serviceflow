import { NextResponse } from "next/server";
import { calculateQuote } from "@/lib/quote";
import { serviceRequestSchema, toFieldErrors } from "@/lib/validation";
import { StorageNotConfiguredError, getRequestRepository } from "@/lib/repositories/requests";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10_000;

/**
 * POST /api/requests
 * Validates a service request, recalculates the estimate on the server
 * (the browser's numbers are never trusted) and stores it.
 */
export async function POST(request: Request) {
  const limited = rateLimit(`requests:${clientKey(request)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests from this connection. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "The request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  // Honeypot: answer like a success so bots learn nothing, but store nothing.
  const honeypot = (body as { contact?: { company?: unknown } })?.contact?.company;
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return NextResponse.json({ reference: "BN-000000-0000", estimate: { total: 0 } }, { status: 201 });
  }

  const parsed = serviceRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Some fields need attention.", fieldErrors: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const quote = calculateQuote(parsed.data.quote);
  const { consent: _consent, company: _company, ...contact } = parsed.data.contact;

  try {
    const record = await getRequestRepository().create({
      contact,
      quote: {
        input: quote.input,
        lines: quote.lines,
        subtotal: quote.subtotal,
        discount: quote.discount,
        total: quote.total,
        laborHours: quote.laborHours,
      },
    });

    return NextResponse.json(
      {
        reference: record.reference,
        status: record.status,
        estimate: { total: quote.total, lines: quote.lines, discount: quote.discount },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json(
        { error: "Online requests are unavailable right now. Please call or email us instead." },
        { status: 503 },
      );
    }
    console.error("Failed to store service request", error);
    return NextResponse.json(
      {
        error: "We couldn't save your request. Try again in a moment.",
        // Only in local development, to make setup problems visible. Never sent in production.
        ...(process.env.NODE_ENV === "development" && { detail: error instanceof Error ? error.message : String(error) }),
      },
      { status: 500 },
    );
  }
}

export function GET() {
  // Requests are private. Listing them will live behind admin auth in Phase 2.
  return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
