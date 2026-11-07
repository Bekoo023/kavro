import Link from "next/link";
import { serviceName, services } from "@/config/services";
import { requireAdmin } from "@/lib/auth";
import { getStorage, type Appointment, type QuoteRequest } from "@/lib/storage";
import { kindDot, timeLabel } from "../_components/appointment-ui";
import { addDays } from "../_lib/calendar";
import { ago, daysBetween, fmtDateLong, fmtDateShort, fromYmd, ymd } from "../_lib/format";

export const dynamic = "force-dynamic";

/** Overzicht: alleen wat nu aandacht vraagt en wat eraan komt. Details staan op de eigen pagina's. */
export default async function DashboardPage() {
  await requireAdmin();

  const today = ymd();
  let requests: QuoteRequest[] = [];
  let agenda: Appointment[] = [];
  let loadError: string | null = null;
  try {
    const storage = await getStorage();
    [requests, agenda] = await Promise.all([storage.listRequests(), storage.listAppointments({ from: today, to: addDays(today, 13) })]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Onbekende fout";
  }

  const open = requests.filter((r) => r.status === "nieuw").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const counts = [
    { label: "Nieuw", value: open.length, href: "/beheer/aanvragen?status=nieuw", accent: open.length > 0 },
    { label: "In behandeling", value: requests.filter((r) => r.status === "in-behandeling").length, href: "/beheer/aanvragen?status=in-behandeling" },
    { label: "Ingepland", value: requests.filter((r) => r.status === "ingepland").length, href: "/beheer/aanvragen?status=ingepland" },
  ];

  const hour = Number(new Intl.DateTimeFormat("nl-NL", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Amsterdam" }).format(new Date()));
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="max-w-[960px]">
      <header>
        <p className="text-[14px] text-mute-2 first-letter:uppercase">{fmtDateLong.format(new Date())}</p>
        <h1 className="display mt-1 text-[44px] md:text-[56px]">{greeting}</h1>
      </header>

      {loadError && (
        <p role="alert" className="mt-8 rounded-2xl border border-danger/50 bg-danger/10 p-4">
          Gegevens konden niet worden geladen: {loadError}
        </p>
      )}

      {/* Kerncijfers: één rustige rij */}
      <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-line py-5">
        {counts.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="group flex items-baseline gap-2.5">
              <span className={`display text-[36px] tabular-nums ${c.accent ? "text-accent" : ""}`}>{c.value}</span>
              <span className="text-[14.5px] text-mute group-hover:text-paper">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <Panel title="Te beantwoorden" href="/beheer/aanvragen?status=nieuw" linkLabel="Alle aanvragen">
          {open.length === 0 ? (
            <Empty>Alles is beantwoord.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {open.slice(0, 6).map((r) => {
                const waiting = daysBetween(ymd(new Date(r.createdAt)), today);
                return (
                  <li key={r.id}>
                    <Link href={`/beheer/aanvragen/${r.id}`} className="group flex items-center justify-between gap-4 py-3.5">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
                          {r.name}
                        </span>
                        <span className="block truncate text-[13.5px] text-mute">
                          {r.vehicle} · {r.services.map((s) => services[s]?.short ?? serviceName(s)).join(" + ")}
                        </span>
                      </span>
                      <span className={`shrink-0 text-[13px] ${waiting >= 2 ? "text-accent" : "text-mute-2"}`}>{ago(r.createdAt)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {open.length > 6 && <p className="mt-3 text-[13.5px] text-mute-2">En nog {open.length - 6} meer.</p>}
        </Panel>

        <Panel title="Planning" href="/beheer/agenda" linkLabel="Agenda">
          {agenda.length === 0 ? (
            <Empty>Niets gepland de komende twee weken.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {agenda.slice(0, 6).map((a) => {
                const now = a.startDate <= today && a.endDate >= today;
                return (
                  <li key={a.id}>
                    <Link href={`/beheer/agenda/${a.id}`} className="group flex items-center gap-3 py-3.5">
                      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${kindDot[a.kind]}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
                          {a.title}
                        </span>
                        <span className="block text-[13.5px] text-mute">{timeLabel(a)}</span>
                      </span>
                      <span className={`shrink-0 text-[13px] ${now ? "font-medium text-accent" : "text-mute-2"}`}>
                        {now ? "Vandaag" : fmtDateShort.format(fromYmd(a.startDate))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    // min-w-0: lange titels mogen de gridkolom niet breder dan het scherm maken.
    <section aria-label={title} className="min-w-0">
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        <Link href={href} className="text-[13.5px] text-mute hover:text-paper">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-[14.5px] text-mute">{children}</p>;
}
