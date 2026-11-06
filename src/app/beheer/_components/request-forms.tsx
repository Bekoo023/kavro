"use client";

import { useActionState, useState } from "react";
import { addRequestNote, deleteRequest, setRequestPrice, type RequestFormState } from "../actions";

export function NoteForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(addRequestNote, {});
  return (
    <form action={action} className="rounded-2xl border border-line bg-graphite p-4">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="notitie" className="sr-only">
        Notitie toevoegen
      </label>
      <textarea
        id="notitie"
        name="text"
        rows={3}
        maxLength={4000}
        placeholder="Notitie toevoegen, bijv. ‘Gebeld, stuurt foto’s van de motorkap.’"
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "notitie-fout" : undefined}
        className="field !min-h-[88px] resize-y !border-transparent !bg-transparent !px-1 !py-1 focus-visible:!shadow-none"
      />
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-3">
        <p id="notitie-fout" role="status" className="text-[13.5px] text-danger">
          {state.error}
        </p>
        <button type="submit" disabled={pending} className="btn-primary !min-h-[40px] !px-4 text-[14px]">
          {pending ? "Opslaan…" : "Notitie opslaan"}
        </button>
      </div>
    </form>
  );
}

export function PriceForm({ id, value }: { id: string; value: string }) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(setRequestPrice, {});
  return (
    // key: na opslaan start het veld met de nieuwe waarde.
    <form key={value} action={action}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="prijs" className="text-[13.5px] text-mute">
        Offerteprijs (incl. btw)
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute-2">
            €
          </span>
          <input
            id="prijs"
            name="price"
            inputMode="decimal"
            defaultValue={value}
            placeholder="0,00"
            aria-invalid={state.error ? true : undefined}
            aria-describedby="prijs-hulp"
            className="field !min-h-[44px] !pl-9 tabular-nums"
          />
        </div>
        <button type="submit" disabled={pending} className="rounded-[14px] border border-line-strong px-4 text-[14px] hover:border-paper/60 disabled:opacity-60">
          {pending ? "…" : "Opslaan"}
        </button>
      </div>
      <p id="prijs-hulp" role="status" className={`mt-2 text-[12.5px] ${state.error ? "text-danger" : "text-mute-2"}`}>
        {state.error ?? (state.ok ? "Opgeslagen." : "Alleen voor jezelf. Leeg laten om te wissen.")}
      </p>
    </form>
  );
}

export function DeleteRequestForm({ id }: { id: string }) {
  const [sure, setSure] = useState(false);
  return (
    <form action={deleteRequest} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="flex cursor-pointer items-start gap-2.5 text-[14px] text-mute">
        <input type="checkbox" name="confirm" checked={sure} onChange={(e) => setSure(e.target.checked)} className="mt-1 accent-[var(--color-danger)]" />
        Ja, verwijder deze aanvraag en de hele tijdlijn definitief.
      </label>
      <button
        type="submit"
        disabled={!sure}
        className="min-h-[40px] rounded-full border border-danger/50 px-4 text-[14px] text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Aanvraag verwijderen
      </button>
    </form>
  );
}
