import Link from "next/link";
import { finishes, services } from "@/config/services";
import { telHref } from "@/config/site";
import type { QuoteRequest } from "@/lib/storage/types";
import { ago, euro, fmtDateShort, fmtDateTime, fromYmd, whatsappHref } from "../_lib/format";
import { StatusBadge, StatusSelect } from "./status";

/** Eén aanvraag als kaart: wie, welke auto, wat, wanneer, en direct contact. */
export function RequestRow({ r, compact = false }: { r: QuoteRequest; compact?: boolean }) {
  const serviceNames = r.services.map((s) => services[s]?.name ?? s);
  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-graphite p-5 transition-colors hover:border-line-strong md:grid-cols-[1fr_auto] md:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <StatusBadge status={r.status} />
          <span className="text-[13px] text-mute-2" title={fmtDateTime.format(new Date(r.createdAt))}>
            Binnengekomen {ago(r.createdAt)}
          </span>
        </div>
        <h3 className="mt-3 text-[17px] font-semibold">
          <Link href={`/beheer/aanvragen/${r.id}`} className="decoration-accent underline-offset-4 hover:underline">
            {r.name}
            <span className="font-normal text-mute"> · {r.vehicle}</span>
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {serviceNames.map((n) => (
            <span key={n} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[13px] text-silver-bright">
              {n}
            </span>
          ))}
          {r.finish && (
            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[13px] text-mute">Afwerking: {finishes[r.finish]?.name ?? r.finish}</span>
          )}
          {r.preferredDate && (
            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[13px] text-mute">
              Voorkeur: {fmtDateShort.format(fromYmd(r.preferredDate))}
            </span>
          )}
          {r.priceCents !== null && (
            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[13px] text-paper tabular-nums">{euro(r.priceCents)}</span>
          )}
        </div>
        {!compact && r.message && <p className="mt-3 line-clamp-3 max-w-[72ch] text-[14.5px] whitespace-pre-wrap text-mute">{r.message}</p>}
      </div>

      <div className="flex flex-col gap-3 md:items-end">
        <StatusSelect id={r.id} status={r.status} />
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Link
            href={`/beheer/aanvragen/${r.id}`}
            className="inline-flex min-h-9 items-center rounded-full bg-white/[0.07] px-3.5 text-[13.5px] text-paper transition-colors hover:bg-white/[0.12]"
          >
            Details
          </Link>
          {r.phone && (
            <>
              <ContactLink href={telHref(r.phone)} label={`Bel ${r.name}`}>
                Bellen
              </ContactLink>
              <ContactLink href={whatsappHref(r.phone)} label={`WhatsApp ${r.name}`} external>
                WhatsApp
              </ContactLink>
            </>
          )}
          {r.email && (
            <ContactLink href={`mailto:${r.email}?subject=${encodeURIComponent(`Je aanvraag bij Kavro (${r.vehicle})`)}`} label={`Mail ${r.name}`}>
              Mailen
            </ContactLink>
          )}
        </div>
      </div>
    </article>
  );
}

function ContactLink({ href, label, external, children }: { href: string; label: string; external?: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-h-9 items-center rounded-full border border-line-strong px-3.5 text-[13.5px] text-paper transition-colors hover:border-paper/60 hover:bg-white/[0.04]"
    >
      {children}
    </a>
  );
}
