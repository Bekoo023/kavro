import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { appointmentKindLabels, APPOINTMENT_KINDS, getStorage, type Appointment, type QuoteRequest } from "@/lib/storage";
import { AppointmentCard, kindDot, kindTone, timeLabel } from "../../_components/appointment-ui";
import { eachDay, isMonth, monthGrid, shiftMonth } from "../../_lib/calendar";
import { fmtDateLong, fromYmd, ymd } from "../../_lib/format";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const monthFmt = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric", timeZone: "UTC" });
const MAX_PER_CELL = 3;

export default async function AgendaPage({ searchParams }: PageProps<"/beheer/agenda">) {
  await requireAdmin();
  const sp = await searchParams;
  const today = ymd();
  const raw = Array.isArray(sp.maand) ? sp.maand[0] : sp.maand;
  const month = raw && isMonth(raw) ? raw : today.slice(0, 7);
  const weeks = monthGrid(month);
  const from = weeks[0][0];
  const to = weeks[weeks.length - 1][6];

  let appointments: Appointment[] = [];
  let requests: QuoteRequest[] = [];
  let loadError: string | null = null;
  try {
    const storage = await getStorage();
    [appointments, requests] = await Promise.all([storage.listAppointments({ from, to }), storage.listRequests()]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Onbekende fout";
  }

  // Per dag: afspraken (meerdaags op elke dag) en open voorkeursdata die nog niet zijn ingepland.
  const byDay = new Map<string, Appointment[]>();
  for (const a of appointments) for (const d of eachDay(a.startDate, a.endDate)) byDay.set(d, [...(byDay.get(d) ?? []), a]);
  const plannedRequestIds = new Set(appointments.map((a) => a.requestId).filter(Boolean));
  const wishes = new Map<string, QuoteRequest[]>();
  for (const r of requests) {
    if (!r.preferredDate || plannedRequestIds.has(r.id) || (r.status !== "nieuw" && r.status !== "in-behandeling")) continue;
    if (r.preferredDate < from || r.preferredDate > to) continue;
    wishes.set(r.preferredDate, [...(wishes.get(r.preferredDate) ?? []), r]);
  }
  const monthAppointments = appointments.filter((a) => a.endDate >= `${month}-01` && a.startDate <= `${month}-31`);
  const label = monthFmt.format(new Date(`${month}-01T12:00:00Z`));

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[44px] md:text-[56px]">Agenda</h1>
          <p className="mt-1 text-[14.5px] text-mute first-letter:uppercase">{label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Maand kiezen" className="flex items-center rounded-full border border-line-strong">
            <Link href={`/beheer/agenda?maand=${shiftMonth(month, -1)}`} className="flex h-11 w-11 items-center justify-center rounded-full text-mute hover:text-paper" aria-label="Vorige maand">
              ←
            </Link>
            <Link href="/beheer/agenda" className="px-3 text-[14px] text-mute hover:text-paper">
              Vandaag
            </Link>
            <Link href={`/beheer/agenda?maand=${shiftMonth(month, 1)}`} className="flex h-11 w-11 items-center justify-center rounded-full text-mute hover:text-paper" aria-label="Volgende maand">
              →
            </Link>
          </nav>
          <Link href={`/beheer/agenda/nieuw?datum=${month === today.slice(0, 7) ? today : `${month}-01`}`} className="btn-primary !min-h-[44px] !px-5 text-[14px]">
            + Nieuw item
          </Link>
        </div>
      </header>

      {sp.opgeslagen && (
        <p role="status" className="mt-6 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3 text-[14.5px] text-ok">
          Opgeslagen in de agenda.
        </p>
      )}
      {loadError && (
        <p role="alert" className="mt-6 rounded-2xl border border-danger/50 bg-danger/10 p-4">
          Agenda kon niet worden geladen: {loadError}
        </p>
      )}

      {/* Legenda */}
      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-mute">
        {APPOINTMENT_KINDS.map((k) => (
          <li key={k} className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${kindDot[k]}`} />
            {appointmentKindLabels[k]}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-4 rounded-sm border border-dashed border-mute-2" />
          Voorkeursdatum klant (nog niet ingepland)
        </li>
      </ul>

      {/* Maandraster (vanaf md) */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-line md:block">
        <div className="grid grid-cols-7 border-b border-line bg-graphite text-[12.5px] text-mute-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-3 py-2">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0]} className="grid grid-cols-7 border-b border-line last:border-b-0">
            {week.map((day, i) => {
              const items = byDay.get(day) ?? [];
              const wish = wishes.get(day) ?? [];
              const inMonth = day.startsWith(month);
              const isToday = day === today;
              const weekend = i >= 5;
              return (
                <div
                  key={day}
                  className={`group relative min-h-[132px] border-r border-line p-1.5 last:border-r-0 ${inMonth ? (weekend ? "bg-white/[0.012]" : "") : "bg-black/25"}`}
                >
                  <div className="flex items-center justify-between px-1">
                    <span
                      className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[13px] tabular-nums ${
                        isToday ? "bg-accent font-semibold text-ink" : inMonth ? "text-paper" : "text-mute-2/60"
                      }`}
                    >
                      {Number(day.slice(8))}
                    </span>
                    <Link
                      href={`/beheer/agenda/nieuw?datum=${day}`}
                      aria-label={`Nieuw item op ${fmtDateLong.format(fromYmd(day))}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-mute-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/[0.06] hover:text-paper focus-visible:opacity-100"
                    >
                      +
                    </Link>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {items.slice(0, MAX_PER_CELL).map((a) => {
                      const cont = a.startDate !== day;
                      return (
                        <li key={a.id}>
                          <Link
                            href={`/beheer/agenda/${a.id}`}
                            title={`${a.title} · ${timeLabel(a)}`}
                            className={`block truncate rounded-md border px-1.5 py-0.5 text-[12px] leading-[18px] transition-[filter] hover:brightness-125 ${kindTone[a.kind]} ${cont ? "opacity-70" : ""}`}
                          >
                            {cont ? "↳ " : a.startTime ? <span className="tabular-nums opacity-80">{a.startTime} </span> : null}
                            {a.title}
                          </Link>
                        </li>
                      );
                    })}
                    {items.length > MAX_PER_CELL && <li className="px-1.5 text-[12px] text-mute">+{items.length - MAX_PER_CELL} meer</li>}
                    {wish.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/beheer/aanvragen/${r.id}`}
                          title={`Voorkeursdatum van ${r.name}`}
                          className="block truncate rounded-md border border-dashed border-mute-2/70 px-1.5 py-0.5 text-[12px] leading-[18px] text-mute hover:border-paper/60 hover:text-paper"
                        >
                          {r.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lijst: op mobiel de hoofdweergave, op desktop een samenvatting onder het raster */}
      <section aria-labelledby="lijst-titel" className="mt-10">
        <h2 id="lijst-titel" className="text-[19px] font-semibold first-letter:uppercase">
          {label}
        </h2>
        {monthAppointments.length === 0 && wishes.size === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line-strong px-5 py-10 text-center text-mute">Nog niets gepland deze maand.</p>
        ) : (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {monthAppointments.map((a) => (
              <li key={a.id}>
                <AppointmentCard a={a} />
              </li>
            ))}
            {[...wishes.entries()]
              .filter(([d]) => d.startsWith(month))
              .flatMap(([d, rs]) => rs.map((r) => ({ d, r })))
              .map(({ d, r }) => (
                <li key={r.id}>
                  <Link
                    href={`/beheer/aanvragen/${r.id}`}
                    className="flex items-start gap-3 rounded-xl border border-dashed border-line-strong px-4 py-3 text-mute hover:border-paper/50 hover:text-paper"
                  >
                    <span aria-hidden="true" className="mt-[7px] h-2 w-2 shrink-0 rounded-full border border-mute-2" />
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px]">Voorkeur: {r.name} · {r.vehicle}</span>
                      <span className="block text-[13px] first-letter:uppercase">{fmtDateLong.format(fromYmd(d))} · nog inplannen</span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
