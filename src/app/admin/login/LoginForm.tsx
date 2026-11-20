"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type ActionState } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-xs)] bg-navy font-medium text-ivory transition-colors hover:bg-navy-soft disabled:opacity-60"
    >
      {pending && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

const input =
  "block w-full rounded-[var(--radius-xs)] border border-line bg-paper px-3.5 py-3 text-ink hover:border-navy/40 focus:border-navy focus:outline-none";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionState, FormData>(signIn, null);

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      {state && !state.ok && (
        <p role="alert" className="border-l-2 border-error bg-error/5 px-3 py-2.5 text-sm text-error">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      <Submit />
    </form>
  );
}
