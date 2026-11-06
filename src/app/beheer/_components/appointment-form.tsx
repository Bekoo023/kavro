"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { APPOINTMENT_KINDS, appointmentKindLabels, type Appointment, type AppointmentKind } from "@/lib/storage/types";
import { deleteAppointment, saveAppointment, type AppointmentFormState } from "../actions";

export type RequestOption = { id: string; label: string };

const KIND_HINT: Record<AppointmentKind, string> = {
  werk: "De auto staat bij je in de werkplaats. Gekoppelde aanvragen gaan naar ‘Ingepland’.",
  afspraak: "Kennismaking, ophalen, nakijken of een belafspraak.",
  blokkade: "Vrije dag, vakantie of werkplaats dicht. Klanten zien dit niet.",
};

export function AppointmentForm({
  appointment,
  defaults,
  requests,
}: {
  appointment?: Appointment;
  defaults: { date: string; requestId?: string; title?: string };
  requests: RequestOption[];
}) {
  const action = saveAppointment.bind(null, appointment?.id ?? null);
  const [state, formAction, pending] = useActionState<AppointmentFormState, FormData>(action, {});
  const v = state.values;
  const e = state.errors ?? {};

  const [kind, setKind] = useState<AppointmentKind>((v?.kind as AppointmentKind) ?? appointment?.kind ?? "werk");
  const [allDay, setAllDay] = useState(v ? v.allDay === "on" : appointment ? appointment.startTime === null : false);
  const [title, setTitle] = useState(v?.title ?? appointment?.title ?? defaults.title ?? "");
  const [requestId, setRequestId] = useState(v?.requestId ?? appointment?.requestId ?? defaults.requestId ?? "");
  const [startDate, setStartDate] = useState(v?.startDate ?? appointment?.startDate ?? defaults.date);
  const [endDate, setEndDate] = useState(v?.endDate ?? appointment?.endDate ?? defaults.date);

  const err = (k: string) =>
    e[k] ? (
      <p id={`fout-${k}`} className="mt-1.5 text-[13.5px] text-danger">
        {e[k]}
      </p>
    ) : null;
  const inv = (k: string) => (e[k] ? { "aria-invalid": true, "aria-describedby": `fout-${k}` } : {});

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {state.formError && (
        <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4">
          {state.formError}
        </p>
      )}

      <fieldset>
        <legend className="text-[14px] font-medium">Soort</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {APPOINTMENT_KINDS.map((k) => (
            <label key={k} className="choice !min-h-[52px]">
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
              <span className="text-[14.5px]">{appointmentKindLabels[k]}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-mute-2">{KIND_HINT[kind]}</p>
      </fieldset>

      {kind !== "blokkade" && (
        <div>
          <label htmlFor="requestId" className="text-[14px] font-medium">
            Gekoppelde aanvraag <span className="font-normal text-mute-2">(optioneel)</span>
          </label>
          <select
            id="requestId"
            name="requestId"
            value={requestId}
            onChange={(ev) => {
              const next = requests.find((r) => r.id === ev.target.value);
              const prevAuto = requests.find((r) => r.id === requestId)?.label;
              setRequestId(ev.target.value);
              // Titel automatisch invullen zolang je hem niet zelf hebt aangepast.
              if (next && (title === "" || title === prevAuto)) setTitle(next.label);
            }}
            className="field mt-2"
          >
            <option value="">Geen</option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {kind === "blokkade" && <input type="hidden" name="requestId" value="" />}

      <div>
        <label htmlFor="title" className="text-[14px] font-medium">
          Titel
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          placeholder={kind === "blokkade" ? "Bijv. Vakantie" : "Bijv. Golf 8 · Window tinting"}
          className="field mt-2"
          {...inv("title")}
        />
        {err("title")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="text-[14px] font-medium">
            Van
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(ev) => {
              setStartDate(ev.target.value);
              if (endDate < ev.target.value) setEndDate(ev.target.value);
            }}
            className="field mt-2"
            {...inv("startDate")}
          />
          {err("startDate")}
        </div>
        <div>
          <label htmlFor="endDate" className="text-[14px] font-medium">
            Tot en met
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(ev) => setEndDate(ev.target.value)}
            className="field mt-2"
            {...inv("endDate")}
          />
          {err("endDate")}
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2.5 text-[14.5px]">
          <input type="checkbox" name="allDay" checked={allDay} onChange={(ev) => setAllDay(ev.target.checked)} className="accent-[var(--color-accent)]" />
          Hele dag{startDate !== endDate ? "en" : ""}
        </label>
        {!allDay && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="text-[14px] font-medium">
                Begintijd{startDate !== endDate ? " (eerste dag)" : ""}
              </label>
              <input id="startTime" name="startTime" type="time" step={900} defaultValue={v?.startTime ?? appointment?.startTime ?? "09:00"} className="field mt-2" {...inv("startTime")} />
              {err("startTime")}
            </div>
            <div>
              <label htmlFor="endTime" className="text-[14px] font-medium">
                Eindtijd{startDate !== endDate ? " (laatste dag)" : ""}
              </label>
              <input id="endTime" name="endTime" type="time" step={900} defaultValue={v?.endTime ?? appointment?.endTime ?? "17:00"} className="field mt-2" {...inv("endTime")} />
              {err("endTime")}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="text-[14px] font-medium">
          Notitie <span className="font-normal text-mute-2">(optioneel)</span>
        </label>
        <textarea id="notes" name="notes" rows={3} maxLength={2000} defaultValue={v?.notes ?? appointment?.notes ?? ""} className="field mt-2" />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Opslaan…" : appointment ? "Wijzigingen opslaan" : "In agenda zetten"}
        </button>
        <Link href={`/beheer/agenda?maand=${startDate.slice(0, 7)}`} className="px-3 text-[14.5px] text-mute hover:text-paper">
          Annuleren
        </Link>
      </div>
    </form>
  );
}

export function DeleteAppointmentButton({ id }: { id: string }) {
  return (
    <form
      action={deleteAppointment}
      onSubmit={(ev) => {
        if (!confirm("Deze afspraak uit de agenda verwijderen?")) ev.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="min-h-[40px] rounded-full border border-danger/50 px-4 text-[14px] text-danger transition-colors hover:bg-danger/10">
        Verwijderen
      </button>
    </form>
  );
}
