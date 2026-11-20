"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { REQUEST_STATUSES, statusLabels } from "@/lib/admin/status";
import { rateLimit } from "@/lib/rate-limit";

export type ActionState = { ok: boolean; message: string } | null;

/* ─── Sign in / out ────────────────────────────────────────────────────── */

const signInSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
  next: z.string().optional(),
});

/** Only allow redirects back into the admin area, never to another site. */
function safeNext(value: string | undefined): string {
  return value && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 8, 5 * 60_000).ok) {
    return { ok: false, message: "Too many sign-in attempts. Wait a few minutes and try again." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    // Same message for unknown email and wrong password, so accounts can't be probed.
    return { ok: false, message: "Email or password is incorrect." };
  }

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account doesn't have access to the admin panel." };
  }

  redirect(safeNext(parsed.data.next));
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login?signed-out=1");
}

/* ─── Request updates ──────────────────────────────────────────────────── */

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(REQUEST_STATUSES),
});

export async function updateRequestStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Choose a valid status." };

  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "Your session has ended. Sign in again to make changes." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_requests")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: "The status couldn't be saved. Try again." };
  if (!data) return { ok: false, message: "This request no longer exists or you can't edit it." };

  revalidatePath("/admin", "layout");
  return { ok: true, message: `Status changed to ${statusLabels[parsed.data.status]}.` };
}

const notesSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(2000, "Notes can be up to 2,000 characters."),
});

export async function updateAdminNotes(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = notesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  try {
    await requireAdmin();
  } catch {
    return { ok: false, message: "Your session has ended. Sign in again to make changes." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_requests")
    .update({ admin_notes: parsed.data.notes.trim() })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: "The notes couldn't be saved. Try again." };
  if (!data) return { ok: false, message: "This request no longer exists or you can't edit it." };

  revalidatePath(`/admin/requests/${parsed.data.id}`);
  return { ok: true, message: "Notes saved." };
}
