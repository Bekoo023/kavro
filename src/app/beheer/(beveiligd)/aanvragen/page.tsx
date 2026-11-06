import Link from "next/link";
import { services, SERVICE_SLUGS, type ServiceSlug } from "@/config/services";
import { requireAdmin } from "@/lib/auth";
import { getStorage, REQUEST_STATUSES, statusLabels, type QuoteRequest, type RequestStatus } from "@/lib/storage";
import { RequestRow } from "../../_components/request-row";
import { statusDot } from "../../_components/status";

export const dynamic = "force-dynamic";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function RequestsPage({ searchParams }: PageProps<"/beheer/aanvragen">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = (REQUEST_STATUSES as readonly string[]).includes(first(sp.status)) ? (first(sp.status) as RequestStatus) : null;
  const dienst = (SERVICE_SLUGS as readonly string[]).includes(first(sp.dienst)) ? (first(sp.dienst) as ServiceSlug) : null;
  const q = first(sp.q).trim().slice(0, 80);

  let requests: QuoteRequest[] = [];
  let loadError: string | null = null;
  try {
    requests = await (await getStorage()).listRequests();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Onbekende fout";
  }

  const needle = q.toLowerCase();
  const matchesSearch = (r: QuoteRequest) =>
    !needle || [r.name, r.vehicle, r.email ?? "", r.phone ?? "", r.message ?? ""].some((f) => f.toLowerCase().includes(needle));
  const base = requests.filter((r) => matchesSearch(r) && (!dienst || r.services.includes(dienst)));
  const shown = status ? base.filter((r) => r.status === status) : base;
  const counts = Object.fromEntries(REQUEST_STATUSES.map((s) => [s, base.filter((r) => r.status === s).length])) as Record<RequestStatus, number>;

  const href = (next: { status?: RequestStatus | null; dienst?: ServiceSlug | null }) => {
    const p = new URLSearchParams();
    const s = next.status === undefined ? status : next.status;
    const d = next.dienst === undefined ? dienst : next.dienst;
    if (s) p.set("status", s);
    if (d) p.set("dienst", d);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/beheer/aanvragen?${qs}` : "/beheer/aanvragen";
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[44px] md:text-[56px]">Aanvragen</h1>
          <p className="mt-1 text-[14.5px] text-mute">Alle offerteaanvragen van de website, nieuwste eerst.</p>
        </div>
        <form role="search" className="relative w-full sm:w-[320px]">
          {status && <input type="hidden" name="status" value={status} />}
          {dienst && <input type="hidden" name="dienst" value={dienst} />}
          <label htmlFor="zoek" className="sr-only">
            Zoek op naam, auto, e-mail of telefoon
          </label>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute-2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input id="zoek" name="q" type="search" defaultValue={q} placeholder="Zoek naam, auto, telefoon…" className="field !min-h-[46px] !rounded-full !pl-11" />
        </form>
      </header>

      {/* Statusfilter */}
      <nav aria-label="Filter op status" className="-mx-5 mt-8 overflow-x-auto px-5">
        <ul className="flex min-w-max gap-2">
          <FilterPill href={href({ status: null })} active={!status} count={base.length}>
            Alle
          </FilterPill>
          {REQUEST_STATUSES.map((s) => (
            <FilterPill key={s} href={href({ status: s })} active={status === s} count={counts[s]} dot={statusDot[s]}>
              {statusLabels[s]}
            </FilterPill>
          ))}
        </ul>
      </nav>

      {/* Dienstfilter */}
      <nav aria-label="Filter op dienst" className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
        <span className="text-mute-2">Dienst:</span>
        <Link href={href({ dienst: null })} aria-current={!dienst ? "true" : undefined} className={!dienst ? "text-paper underline decoration-accent underline-offset-4" : "text-mute hover:text-paper"}>
          Alle
        </Link>
        {SERVICE_SLUGS.map((s) => (
          <Link key={s} href={href({ dienst: s })} aria-current={dienst === s ? "true" : undefined} className={dienst === s ? "text-paper underline decoration-accent underline-offset-4" : "text-mute hover:text-paper"}>
            {services[s].name}
          </Link>
        ))}
      </nav>

      {first(sp.verwijderd) && (
        <p role="status" className="mt-6 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3 text-[14.5px] text-ok">
          Aanvraag verwijderd.
        </p>
      )}

      {loadError && (
        <p role="alert" className="mt-8 rounded-2xl border border-danger/50 bg-danger/10 p-4">
          Aanvragen konden niet worden geladen: {loadError}
        </p>
      )}

      <p className="mt-8 text-[13.5px] text-mute-2" role="status">
        {shown.length === 1 ? "1 aanvraag" : `${shown.length} aanvragen`}
        {q && <> voor &lsquo;{q}&rsquo;</>}
        {(q || status || dienst) && (
          <>
            {" · "}
            <Link href="/beheer/aanvragen" className="text-mute underline underline-offset-4 hover:text-paper">
              Filters wissen
            </Link>
          </>
        )}
      </p>

      {!loadError && shown.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line-strong px-5 py-12 text-center text-mute">
          Geen aanvragen gevonden{status ? ` met status ‘${statusLabels[status]}’` : ""}.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {shown.map((r) => (
            <RequestRow key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ href, active, count, dot, children }: { href: string; active: boolean; count: number; dot?: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[14px] transition-colors ${
          active ? "border-paper bg-paper text-ink" : "border-line-strong text-mute hover:border-paper/50 hover:text-paper"
        }`}
      >
        {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
        {children}
        <span className={`tabular-nums ${active ? "text-ink/60" : "text-mute-2"}`}>{count}</span>
      </Link>
    </li>
  );
}
