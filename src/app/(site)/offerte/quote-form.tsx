"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { finishes, FINISH_SLUGS, services, SERVICE_SLUGS } from "@/config/services";
import { validateQuote, type QuoteErrors, type QuoteFieldName, type QuoteFields } from "@/lib/quote-schema";
import { submitQuote, type QuoteState } from "./actions";

const ORDER: QuoteFieldName[] = ["services", "finish", "vehicle", "name", "contact", "email", "phone", "preferredDate", "message"];

export function QuoteForm({
  initial,
  submissionId,
  minDate,
}: {
  initial: QuoteFields;
  submissionId: string;
  minDate: string;
}) {
  const [state, formAction, pending] = useActionState<QuoteState, FormData>(submitQuote, { status: "idle" });
  const [fields, setFields] = useState<QuoteFields>(() => (state.status === "error" ? state.fields : initial));
  const [errors, setErrors] = useState<QuoteErrors>(() => (state.status === "error" ? state.errors : {}));
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);
  const [seenState, setSeenState] = useState(state);

  // Nieuw serverantwoord: fouten overnemen. Ingevulde waarden blijven staan (gecontroleerde velden).
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") setErrors(state.errors);
  }

  // Focus naar de eerste fout of de bevestiging.
  useEffect(() => {
    if (state.status === "error") {
      if (state.formError) formErrorRef.current?.focus();
      else focusFirst(state.errors);
    }
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  function focusFirst(errs: QuoteErrors) {
    const first = ORDER.find((k) => errs[k]);
    if (!first) return;
    const target = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    target?.focus();
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function set<K extends keyof QuoteFields>(key: K, value: QuoteFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key] && !(key === "email" || key === "phone" ? e.contact : false)) return e;
      const next = { ...e };
      delete next[key];
      if (key === "email" || key === "phone") delete next.contact;
      return next;
    });
  }

  function toggleService(slug: string, on: boolean) {
    set("services", on ? [...fields.services, slug] : fields.services.filter((s) => s !== slug));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (pending) {
      e.preventDefault();
      return;
    }
    const res = validateQuote(fields);
    if (!res.ok) {
      e.preventDefault();
      setErrors(res.errors);
      focusFirst(res.errors);
    }
  }

  if (state.status === "success") {
    return (
      <div role="status" className="py-4">
        <span className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink shadow-[0_0_40px_-6px_var(--color-accent)]" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 14 14"><path d="M2 7.5 L5.5 11 L12 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h2 ref={successRef} tabIndex={-1} className="display text-[44px] md:text-[56px] focus:outline-none">
          Aanvraag ontvangen.
        </h2>
        <p className="mt-4 max-w-[46ch] text-[18px] text-mute">
          {state.name ? `Bedankt, ${state.name}. ` : "Bedankt. "}
          We nemen contact met je op{state.contact ? ` via ${state.contact}` : ""} om de details en een datum te bespreken.
        </p>
        <Link href="/" className="link-line mt-6">
          Terug naar de homepage
        </Link>
      </div>
    );
  }

  const showFinish = fields.services.includes("chrome-delete");
  const describe = (k: QuoteFieldName, extra?: string) =>
    [errors[k] ? `fout-${k}` : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="space-y-10" aria-busy={pending}>
      <input type="hidden" name="submissionId" value={submissionId} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {state.status === "error" && state.formError && (
        <div ref={formErrorRef} tabIndex={-1} role="alert" className="border border-danger/60 bg-danger/10 px-4 py-3 text-[15px] text-paper">
          {state.formError}
        </div>
      )}

      {/* Dienst */}
      <fieldset aria-describedby={describe("services")}>
        <legend className="text-[16px] font-medium">
          Waar wil je een offerte voor? <span className="font-normal text-mute-2">(één of meer)</span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {SERVICE_SLUGS.map((slug, i) => {
            const checked = fields.services.includes(slug);
            return (
              <label
                key={slug}
                className={`choice ${!checked && errors.services ? "!border-danger" : ""}`}
              >
                <input
                  type="checkbox"
                  name="services"
                  value={slug}
                  checked={checked}
                  onChange={(e) => toggleService(slug, e.target.checked)}
                  data-field={i === 0 ? "services" : undefined}
                  className="h-5 w-5 shrink-0"
                />
                <span className="text-[15px] leading-tight">{services[slug].name}</span>
              </label>
            );
          })}
        </div>
        <FieldError id="fout-services" message={errors.services} />
      </fieldset>

      {showFinish && (
        <fieldset>
          <legend className="text-[16px] font-medium">
            Afwerking raamomlijsting <span className="font-normal text-mute-2">(optioneel)</span>
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-md">
            {FINISH_SLUGS.map((slug, i) => {
              const checked = fields.finish === slug;
              return (
                <label
                  key={slug}
                  className="choice"
                >
                  <input
                    type="radio"
                    name="finish"
                    value={slug}
                    checked={checked}
                    onChange={() => set("finish", slug)}
                    data-field={i === 0 ? "finish" : undefined}
                    className="h-5 w-5"
                  />
                  <span className="text-[15px]">{finishes[slug].name}</span>
                </label>
              );
            })}
          </div>
          {fields.finish && (
            <button type="button" onClick={() => set("finish", "")} className="link-line mt-1 text-[14px] text-mute">
              Nog geen keuze
            </button>
          )}
        </fieldset>
      )}
      {!showFinish && <input type="hidden" name="finish" value="" />}

      <TextField
        label="Merk en model"
        name="vehicle"
        value={fields.vehicle}
        onChange={(v) => set("vehicle", v)}
        error={errors.vehicle}
        placeholder="Bijv. Volkswagen Golf 2021"
        autoComplete="off"
      />

      <TextField label="Naam" name="name" value={fields.name} onChange={(v) => set("name", v)} error={errors.name} autoComplete="name" />

      <fieldset aria-describedby={describe("contact", "contact-hint")}>
        <legend className="text-[16px] font-medium">Hoe kunnen we je bereiken?</legend>
        <p id="contact-hint" className="mt-1 text-[14px] text-mute">
          Vul een e-mailadres of telefoonnummer in. Allebei mag ook.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <TextField
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            value={fields.email}
            onChange={(v) => set("email", v)}
            error={errors.email}
            groupInvalid={Boolean(errors.contact)}
            autoComplete="email"
            dataField={errors.contact && !errors.email ? "contact" : undefined}
          />
          <TextField
            label="Telefoon"
            name="phone"
            type="tel"
            inputMode="tel"
            value={fields.phone}
            onChange={(v) => set("phone", v)}
            error={errors.phone}
            groupInvalid={Boolean(errors.contact)}
            autoComplete="tel"
          />
        </div>
        <FieldError id="fout-contact" message={errors.contact} />
      </fieldset>

      <div>
        <label htmlFor="preferredDate" className="block text-[16px] font-medium">
          Voorkeursdatum <span className="font-normal text-mute-2">(optioneel)</span>
        </label>
        <p id="datum-hint" className="mt-1 text-[14px] text-mute">
          Dit is nog geen afspraak. We bevestigen de datum na overleg.
        </p>
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          min={minDate}
          value={fields.preferredDate}
          onChange={(e) => set("preferredDate", e.target.value)}
          aria-invalid={errors.preferredDate ? true : undefined}
          aria-describedby={describe("preferredDate", "datum-hint")}
          data-field="preferredDate"
          className="field mt-2 sm:max-w-[260px]"
        />
        <FieldError id="fout-preferredDate" message={errors.preferredDate} />
      </div>

      <div>
        <label htmlFor="message" className="block text-[16px] font-medium">
          Toelichting <span className="font-normal text-mute-2">(optioneel)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={fields.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe("message")}
          data-field="message"
          placeholder="Bijv. welke delen of ramen, of een vraag"
          className="field mt-2 resize-y"
        />
        <FieldError id="fout-message" message={errors.message} />
      </div>

      <div className="border-t border-line pt-8">
        <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto sm:min-w-[280px]">
          {pending ? "Bezig met versturen…" : "Verstuur aanvraag"}
        </button>
        <p className="mt-4 max-w-[52ch] text-[14px] text-mute">
          We gebruiken je gegevens alleen om op deze aanvraag te reageren.{" "}
          <Link href="/privacy" className="underline decoration-line-strong underline-offset-4 hover:decoration-paper">
            Privacy
          </Link>
        </p>
      </div>
    </form>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  groupInvalid,
  type = "text",
  inputMode,
  placeholder,
  autoComplete,
  dataField,
}: {
  label: string;
  name: keyof QuoteFields;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  groupInvalid?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  autoComplete?: string;
  dataField?: string;
}) {
  const invalid = Boolean(error) || Boolean(groupInvalid);
  const describedBy = [error ? `fout-${name}` : null, groupInvalid ? "fout-contact" : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className="block text-[16px] font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        data-field={dataField ?? name}
        className="field mt-2"
      />
      <FieldError id={`fout-${name}`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-[14px] text-danger">
      {message}
    </p>
  );
}
