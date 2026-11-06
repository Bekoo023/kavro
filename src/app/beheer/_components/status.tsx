"use client";

import { useRef } from "react";
import { REQUEST_STATUSES, statusLabels, type RequestStatus } from "@/lib/storage/types";
import { updateRequestStatus } from "../actions";

/** Kleur per status: nieuw springt eruit (accent), afgerond/geannuleerd trekken zich terug. */
export const statusTone: Record<RequestStatus, string> = {
  nieuw: "border-accent/50 bg-accent/12 text-accent",
  "in-behandeling": "border-silver/40 bg-silver/10 text-silver-bright",
  ingepland: "border-ok/45 bg-ok/12 text-ok",
  afgerond: "border-line-strong bg-white/[0.03] text-mute",
  geannuleerd: "border-danger/35 bg-danger/8 text-danger/90",
};

export const statusDot: Record<RequestStatus, string> = {
  nieuw: "bg-accent",
  "in-behandeling": "bg-silver",
  ingepland: "bg-ok",
  afgerond: "bg-mute-2",
  geannuleerd: "bg-danger",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12.5px] font-medium whitespace-nowrap ${statusTone[status]}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {statusLabels[status]}
    </span>
  );
}

/** Statuskeuze die direct opslaat bij wijzigen (met knop als fallback zonder JavaScript). */
export function StatusSelect({ id, status }: { id: string; status: RequestStatus }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    // key: na opslaan herstelt React het formulier naar defaultValue; met een nieuwe key
    // start het formulier opnieuw met de bijgewerkte status.
    <form key={status} ref={formRef} action={updateRequestStatus} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`status-${id}`} className="sr-only">
        Status wijzigen
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="field !min-h-[38px] !w-auto !rounded-full !py-1.5 !pr-8 !pl-3.5 !text-[14px]"
      >
        {REQUEST_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s]}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="rounded-full border border-line-strong px-3 py-1.5 text-[14px]">
          Opslaan
        </button>
      </noscript>
    </form>
  );
}
