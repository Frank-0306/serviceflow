"use client";

import { useRef, useState, type FormEvent } from "react";
import { CONTACT_TOPICS, contactMessageSchema, contactTopicLabels, toFieldErrors } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Honeypot, SelectField, TextAreaField, TextField } from "./Fields";

const empty = { name: "", email: "", topic: "", message: "", company: "" };

export function ContactForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof typeof empty, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const parsed = contactMessageSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error);
      setErrors(fieldErrors);
      document.getElementById(Object.keys(fieldErrors)[0])?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 400 && data?.fieldErrors) {
        setErrors(data.fieldErrors);
        setStatus("idle");
        return;
      }
      if (!res.ok) {
        setFormError(data?.error ?? "We couldn't send your message. Try again in a moment.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
      requestAnimationFrame(() => sentRef.current?.focus());
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div ref={sentRef} tabIndex={-1} role="status" className="animate-rise border-t border-navy pt-8 outline-none">
        <h2 className="type-h2 text-navy">Message sent</h2>
        <p className="type-lead mt-4 max-w-[46ch]">
          Thanks, {values.name.split(" ")[0]}. On a live site we&apos;d reply to {values.email} within one business day. This demo doesn&apos;t store or forward messages.
        </p>
        <button
          type="button"
          className="link-underline mt-8 text-navy"
          onClick={() => {
            setValues(empty);
            setStatus("idle");
          }}
        >
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot value={values.company} onChange={(v) => update("company", v)} />
      <TextField id="name" label="Name" autoComplete="name" value={values.name} onChange={(e) => update("name", e.target.value)} error={errors.name} />
      <TextField id="email" label="Email" type="email" autoComplete="email" value={values.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
      <SelectField
        id="topic"
        label="What is it about?"
        placeholder="Choose a topic"
        wrapperClassName="sm:col-span-2"
        value={values.topic}
        onChange={(e) => update("topic", e.target.value)}
        error={errors.topic}
        options={CONTACT_TOPICS.map((t) => ({ value: t, label: contactTopicLabels[t] }))}
      />
      <TextAreaField id="message" label="Message" rows={6} wrapperClassName="sm:col-span-2" value={values.message} onChange={(e) => update("message", e.target.value)} error={errors.message} />
      {formError && (
        <p role="alert" className="border-l-2 border-error bg-error/5 px-4 py-3 text-sm text-error sm:col-span-2">
          {formError}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" loading={status === "sending"}>
          {status === "sending" ? "Sending message…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
