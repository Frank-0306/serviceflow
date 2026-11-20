"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import { updateAdminNotes, updateRequestStatus, type ActionState } from "@/app/admin/actions";
import { REQUEST_STATUSES, statusHints, statusLabels, type RequestStatus } from "@/lib/admin/status";

function SubmitButton({ children, pendingText, pending, disabled }: { children: string; pendingText: string; pending: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-xs)] bg-navy px-4 text-sm font-medium text-ivory transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending && <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />}
      {pending ? pendingText : children}
    </button>
  );
}

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-moss" : "text-error"}`}>
      {state.ok ? "✓ " : ""}
      {state.message}
    </p>
  );
}

/**
 * Submits through the action without using <form action>, because React 19
 * resets forms after an action and would desync these controlled fields.
 */
function submitWith(dispatch: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  };
}

/**
 * Status picker. Moving to Cancelled asks for confirmation first,
 * because it removes the request from the open pipeline.
 */
export function StatusForm({ id, current }: { id: string; current: RequestStatus }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateRequestStatus, null);
  const [selected, setSelected] = useState<RequestStatus>(current);
  const [confirming, setConfirming] = useState(false);

  // When the server confirms a change, the page re-renders with a new `current`.
  useEffect(() => {
    setSelected(current);
    setConfirming(false);
  }, [current]);

  const changed = selected !== current;
  const needsConfirm = selected === "cancelled" && changed;

  return (
    <form
      onSubmit={(e) => {
        if (needsConfirm && !confirming) {
          e.preventDefault();
          setConfirming(true);
          return;
        }
        submitWith(action)(e);
      }}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={id} />
      <fieldset>
        <legend className="sr-only">Request status</legend>
        <div className="grid gap-1.5">
          {REQUEST_STATUSES.map((status) => (
            <label
              key={status}
              className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-xs)] border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage ${
                selected === status ? "border-navy bg-paper" : "border-line hover:border-navy/30"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={selected === status}
                onChange={() => {
                  setSelected(status);
                  setConfirming(false);
                }}
                className="h-4 w-4 accent-navy"
              />
              <span className="flex-1">
                <span className="font-medium text-navy">{statusLabels[status]}</span>
                {status === current && <span className="ml-2 text-xs text-muted">Current</span>}
                <span className="block text-xs text-muted">{statusHints[status]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {confirming && (
        <div role="alert" className="border-l-2 border-error bg-error/5 px-3 py-2.5 text-sm text-error">
          Cancel this request? It will leave the open pipeline. You can change it back later.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingText="Saving…" pending={pending} disabled={!changed}>
          {confirming ? "Yes, cancel request" : "Update status"}
        </SubmitButton>
        {confirming && (
          <button type="button" onClick={() => setConfirming(false)} className="text-sm text-navy underline-offset-4 hover:underline">
            Keep current status
          </button>
        )}
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function NotesForm({ id, initial }: { id: string; initial: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateAdminNotes, null);
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial.trim());
  const [submitted, setSubmitted] = useState(initial.trim());

  useEffect(() => {
    if (state?.ok) setSaved(submitted);
  }, [state, submitted]);

  const dirty = value.trim() !== saved;

  return (
    <form
      onSubmit={(e) => {
        setSubmitted(value.trim());
        submitWith(action)(e);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="id" value={id} />
      <label htmlFor="admin-notes" className="sr-only">
        Internal notes
      </label>
      <textarea
        id="admin-notes"
        name="notes"
        rows={4}
        maxLength={2000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Only visible to admins. Call outcomes, access details, follow-up dates…"
        className="block w-full resize-y rounded-[var(--radius-xs)] border border-line bg-paper px-3 py-2.5 text-base leading-relaxed text-ink sm:text-sm placeholder:text-muted/70 focus:border-navy focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingText="Saving…" pending={pending} disabled={!dirty}>
          Save notes
        </SubmitButton>
        <span className="text-xs tabular-nums text-muted">{value.length} / 2,000</span>
      </div>
      <Feedback state={dirty ? null : state} />
    </form>
  );
}
