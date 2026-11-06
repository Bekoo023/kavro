import Link from "next/link";
import type { Appointment, AppointmentKind } from "@/lib/storage/types";
import { fmtDateShort, fromYmd } from "../_lib/format";

/** Kleuren per soort: werk = accent (daar draait het om), afspraak = zilver, blokkade = gearceerd. */
export const kindTone: Record<AppointmentKind, string> = {
  werk: "border-accent/45 bg-accent/12 text-accent",
  afspraak: "border-silver/40 bg-silver/10 text-silver-bright",
  blokkade: "border-danger/30 text-danger/90 bg-[repeating-linear-gradient(135deg,rgb(255_155_138/0.10)_0_6px,transparent_6px_12px)]",
};

export const kindDot: Record<AppointmentKind, string> = {
  werk: "bg-accent",
  afspraak: "bg-silver",
  blokkade: "bg-danger",
};

export function timeLabel(a: Appointment) {
  return a.startTime ? `${a.startTime}–${a.endTime}` : "Hele dag";
}

/** "di 10 nov – do 12 nov" of "di 10 nov". */
export function dateRangeLabel(a: Appointment) {
  const s = fmtDateShort.format(fromYmd(a.startDate));
  return a.endDate === a.startDate ? s : `${s} – ${fmtDateShort.format(fromYmd(a.endDate))}`;
}

/** Kaartje voor lijsten (overzicht, aanvraagdetail, agendalijst). */
export function AppointmentCard({ a, showDate = true }: { a: Appointment; showDate?: boolean }) {
  return (
    <Link
      href={`/beheer/agenda/${a.id}`}
      className="flex items-start gap-3 rounded-xl border border-line bg-graphite px-4 py-3 transition-colors hover:border-line-strong"
    >
      <span aria-hidden="true" className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${kindDot[a.kind]}`} />
      <span className="min-w-0">
        <span className="block truncate text-[14.5px] font-medium">{a.title}</span>
        <span className="block text-[13px] text-mute">
          {showDate && <>{dateRangeLabel(a)} · </>}
          {timeLabel(a)}
        </span>
      </span>
    </Link>
  );
}
