import Link from "next/link";
import { notFound } from "next/navigation";
import { finishes, services } from "@/config/services";
import { telHref } from "@/config/site";
import { requireAdmin } from "@/lib/auth";
import { getStorage, statusLabels, type RequestEvent, type RequestStatus } from "@/lib/storage";
import { AppointmentCard } from "../../../_components/appointment-ui";
import { DeleteRequestForm, NoteForm, PriceForm } from "../../../_components/request-forms";
import { StatusBadge, statusDot, StatusSelect } from "../../../_components/status";
import { ago, euro, euroInput, fmtDateLong, fmtDateTime, fromYmd, until, whatsappHref } from "../../../_lib/format";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({ params }: PageProps<"/beheer/aanvragen/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const storage = await getStorage();
  const r = await storage.getRequest(id);
  if (!r) notFound();
  const [events, appointments] = await Promise.all([storage.listRequestEvents(id), storage.listAppointments({ requestId: id })]);

  return (
    <div>
      <Link href="/beheer/aanvragen" className="inline-flex min-h-9 items-center gap-1.5 text-[14px] text-mute hover:text-paper">
        ← Alle aanvragen
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={r.status} />
            <span className="text-[13.5px] text-mute-2">Binnengekomen {fmtDateTime.format(new Date(r.createdAt))}</span>
          </div>
          <h1 className="display mt-3 text-[40px] md:text-[56px]">{r.name}</h1>
          <p className="mt-1 text-[18px] text-mute">{r.vehicle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {r.phone && (
            <>
              <Action href={telHref(r.phone)}>Bellen</Action>
              <Action href={whatsappHref(r.phone)} external>
                WhatsApp
              </Action>
            </>
          )}
          {r.email && <Action href={`mailto:${r.email}?subject=${encodeURIComponent(`Je aanvraag bij Kavro (${r.vehicle})`)}`}>Mailen</Action>}
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Aanvraag */}
          <section aria-labelledby="aanvraag-titel" className="rounded-2xl border border-line bg-graphite p-5 md:p-6">
            <h2 id="aanvraag-titel" className="text-[17px] font-semibold">
              Aanvraag
            </h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field label="Dienst">{r.services.map((s) => services[s]?.name ?? s).join(", ")}</Field>
              {r.finish && <Field label="Afwerking">{finishes[r.finish]?.name ?? r.finish}</Field>}
              <Field label="Auto">{r.vehicle}</Field>
              <Field label="Voorkeursdatum">
                {r.preferredDate ? (
                  <>
                    <span className="first-letter:uppercase">{fmtDateLong.format(fromYmd(r.preferredDate))}</span>
                    <span className="text-mute"> · {until(r.preferredDate)}</span>
                  </>
                ) : (
                  <span className="text-mute">Geen voorkeur</span>
                )}
              </Field>
              <Field label="E-mail">{r.email ? <a className="underline underline-offset-4" href={`mailto:${r.email}`}>{r.email}</a> : <span className="text-mute">-</span>}</Field>
              <Field label="Telefoon">{r.phone ? <a className="underline underline-offset-4" href={telHref(r.phone)}>{r.phone}</a> : <span className="text-mute">-</span>}</Field>
            </dl>
            {r.message && (
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-[13.5px] text-mute">Toelichting van de klant</p>
                <p className="mt-2 max-w-[72ch] whitespace-pre-wrap">{r.message}</p>
              </div>
            )}
          </section>

          {/* Tijdlijn */}
          <section aria-labelledby="tijdlijn-titel">
            <h2 id="tijdlijn-titel" className="text-[17px] font-semibold">
              Tijdlijn &amp; notities
            </h2>
            <div className="mt-4">
              <NoteForm id={r.id} />
            </div>
            <ol className="relative mt-6 space-y-5 border-l border-line pl-6">
              {[...events].reverse().map((e) => (
                <TimelineItem key={e.id} e={e} />
              ))}
              <li className="relative">
                <Dot className="bg-accent" />
                <p className="text-[14.5px]">Aanvraag binnengekomen via de website</p>
                <p className="mt-0.5 text-[12.5px] text-mute-2">{fmtDateTime.format(new Date(r.createdAt))}</p>
              </li>
            </ol>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <section aria-labelledby="status-titel" className="rounded-2xl border border-line bg-graphite p-5">
            <h2 id="status-titel" className="text-[13.5px] text-mute">
              Status
            </h2>
            <div className="mt-2">
              <StatusSelect id={r.id} status={r.status} />
            </div>
            <p className="mt-3 text-[12.5px] text-mute-2">Wijzigingen komen automatisch in de tijdlijn.</p>
          </section>

          <section aria-labelledby="planning-titel" className="rounded-2xl border border-line bg-graphite p-5">
            <h2 id="planning-titel" className="text-[13.5px] text-mute">
              Agenda
            </h2>
            {appointments.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {appointments.map((a) => (
                  <li key={a.id}>
                    <AppointmentCard a={a} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[14px] text-mute-2">Nog niet ingepland.</p>
            )}
            <Link
              href={`/beheer/agenda/nieuw?aanvraag=${r.id}`}
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-paper px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-accent"
            >
              {appointments.length > 0 ? "Nog een moment inplannen" : "Inplannen"}
            </Link>
          </section>

          <section aria-label="Offerteprijs" className="rounded-2xl border border-line bg-graphite p-5">
            <PriceForm id={r.id} value={euroInput(r.priceCents)} />
          </section>

          <details className="group rounded-2xl border border-line bg-graphite p-5">
            <summary className="cursor-pointer list-none text-[14px] text-mute hover:text-paper [&::-webkit-details-marker]:hidden">
              Aanvraag verwijderen…
            </summary>
            <div className="mt-4">
              <DeleteRequestForm id={r.id} />
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}

function TimelineItem({ e }: { e: RequestEvent }) {
  const when = (
    <p className="mt-0.5 text-[12.5px] text-mute-2" title={fmtDateTime.format(new Date(e.createdAt))}>
      {fmtDateTime.format(new Date(e.createdAt))} · {ago(e.createdAt)}
    </p>
  );
  if (e.kind === "note") {
    return (
      <li className="relative">
        <Dot className="bg-paper" />
        <div className="rounded-xl border border-line bg-graphite px-4 py-3">
          <p className="max-w-[72ch] text-[14.5px] whitespace-pre-wrap">{e.body}</p>
        </div>
        {when}
      </li>
    );
  }
  if (e.kind === "status") {
    const s = e.body as RequestStatus;
    return (
      <li className="relative">
        <Dot className={statusDot[s] ?? "bg-mute-2"} />
        <p className="text-[14.5px]">
          Status gewijzigd naar <strong className="font-semibold">{statusLabels[s] ?? s}</strong>
        </p>
        {when}
      </li>
    );
  }
  if (e.kind === "planned") {
    return (
      <li className="relative">
        <Dot className="bg-ok" />
        <p className="text-[14.5px]">
          Ingepland vanaf <strong className="font-semibold first-letter:uppercase">{fmtDateLong.format(fromYmd(e.body))}</strong>
        </p>
        {when}
      </li>
    );
  }
  return (
    <li className="relative">
      <Dot className="bg-silver" />
      <p className="text-[14.5px]">
        {e.body === "" ? "Offerteprijs gewist" : <>Offerteprijs gezet op <strong className="font-semibold tabular-nums">{euro(Number(e.body))}</strong></>}
      </p>
      {when}
    </li>
  );
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute top-[7px] -left-[29px] h-[9px] w-[9px] rounded-full ring-4 ring-ink ${className}`} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-mute-2">{label}</dt>
      <dd className="mt-0.5 text-[15px]">{children}</dd>
    </div>
  );
}

function Action({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-[14.5px] font-medium transition-colors hover:border-paper/60 hover:bg-white/[0.04]"
    >
      {children}
    </a>
  );
}
