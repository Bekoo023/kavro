import Link from "next/link";
import { finishes, services } from "@/config/services";
import { telHref } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import { getStorage, REQUEST_STATUSES, statusLabels, type QuoteRequest, type RequestStatus } from "@/lib/storage";
import { updateRequestStatus } from "../actions";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" });
const fmtDate = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeZone: "Europe/Amsterdam" });

export default async function RequestsPage({ searchParams }: PageProps<"/beheer">) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = (REQUEST_STATUSES as readonly string[]).includes(String(sp.status)) ? (sp.status as RequestStatus) : null;

  let requests: QuoteRequest[] = [];
  let loadError: string | null = null;
  try {
    requests = await (await getStorage()).listRequests();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Onbekende fout";
  }
  const shown = filter ? requests.filter((r) => r.status === filter) : requests;
  const counts = Object.fromEntries(REQUEST_STATUSES.map((s) => [s, requests.filter((r) => r.status === s).length]));

  return (
    <div>
      <h1 className="text-[26px] font-medium">Aanvragen</h1>
      <nav aria-label="Filter op status" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
        <Link href="/beheer" className={!filter ? "text-paper underline underline-offset-4" : "text-mute hover:text-paper"}>
          Alle ({requests.length})
        </Link>
        {REQUEST_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/beheer?status=${s}`}
            className={filter === s ? "text-paper underline underline-offset-4" : "text-mute hover:text-paper"}
          >
            {statusLabels[s]} ({counts[s]})
          </Link>
        ))}
      </nav>

      {loadError && (
        <p role="alert" className="mt-6 border border-danger/60 bg-danger/10 p-4">
          Aanvragen konden niet worden geladen: {loadError}
        </p>
      )}
      {!loadError && shown.length === 0 && <p className="mt-8 text-mute">Geen aanvragen{filter ? " met deze status" : ""}.</p>}

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {shown.map((r) => (
          <li key={r.id} className="grid gap-4 py-5 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="text-[13px] text-mute-2">{fmt.format(new Date(r.createdAt))}</p>
              <p className="mt-1 text-[17px] font-medium">
                {r.name} · {r.vehicle}
              </p>
              <p className="mt-1 text-mute">
                {r.services.map((s) => services[s]?.name ?? s).join(", ")}
                {r.finish && <> · afwerking: {finishes[r.finish]?.name ?? r.finish}</>}
              </p>
              <p className="mt-2 flex flex-wrap gap-x-5">
                {r.email && (
                  <a className="underline underline-offset-4" href={`mailto:${r.email}`}>
                    {r.email}
                  </a>
                )}
                {r.phone && (
                  <a className="underline underline-offset-4" href={telHref(r.phone)}>
                    {r.phone}
                  </a>
                )}
              </p>
              {r.preferredDate && (
                <p className="mt-2 text-[14px] text-mute">
                  Voorkeursdatum (nog te bevestigen): {fmtDate.format(new Date(`${r.preferredDate}T12:00:00`))}
                </p>
              )}
              {r.message && <p className="mt-2 max-w-[70ch] whitespace-pre-wrap text-mute">{r.message}</p>}
            </div>
            <form action={updateRequestStatus} className="flex items-start gap-2 md:col-span-4 md:justify-end">
              <input type="hidden" name="id" value={r.id} />
              <label htmlFor={`status-${r.id}`} className="sr-only">
                Status
              </label>
              <select id={`status-${r.id}`} name="status" defaultValue={r.status} className="field !min-h-[42px] !w-auto !py-2">
                {REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="min-h-[42px] border border-line-strong px-3 hover:border-paper">
                Opslaan
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
