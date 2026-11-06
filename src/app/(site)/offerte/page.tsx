import type { Metadata } from "next";
import Image from "next/image";
import { randomUUID } from "node:crypto";
import { ViewTransition } from "react";
import { TintOverlay, TintProvider } from "@/components/tint/tint";
import { media, serviceImageTransition } from "@/config/media";
import { DEFAULT_TINT, finishes, isFinishSlug, isServiceSlug, parseTint } from "@/config/services";
import { site, telHref } from "@/config/site";
import { emptyQuoteFields, todayIso } from "@/lib/quote-schema";
import { QuoteForm } from "./quote-form";

export const metadata: Metadata = {
  title: "Offerte aanvragen",
  description: "Vraag een offerte aan voor PPF, chrome delete of window tinting. Kies je dienst en vul je auto en contactgegevens in.",
  alternates: { canonical: "/offerte" },
};

const NEXT_STEPS = [
  "We bekijken je aanvraag en nemen contact met je op.",
  "Samen bespreken we de mogelijkheden en je krijgt een offerte.",
  "Akkoord? Dan plannen we een datum in.",
];

export default async function OffertePage({ searchParams }: PageProps<"/offerte">) {
  const sp = await searchParams;
  const dienst = Array.isArray(sp.dienst) ? sp.dienst[0] : sp.dienst;
  const afwerking = Array.isArray(sp.afwerking) ? sp.afwerking[0] : sp.afwerking;

  const tintParam = Array.isArray(sp.tint) ? sp.tint[0] : sp.tint;

  const preService = isServiceSlug(dienst) ? [dienst] : [];
  const preFinish = isFinishSlug(afwerking) ? afwerking : "";
  // Tint uit de kiezer op de homepage. Er is geen apart tintveld, dus hij gaat als opmerking mee.
  const preTint = dienst === "window-tinting" ? parseTint(tintParam) : null;
  const preMessage = preTint ? `Gewenste tint: ${preTint}% lichtdoorlatendheid.` : "";
  const headerPhoto = preService[0] ? media.services[preService[0]] : null;

  return (
    <div className="relative overflow-hidden">
      <div className="wrap relative grid gap-12 pt-12 pb-24 md:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-32">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            {headerPhoto && preService[0] && (
              // Kopbeeld van de gekozen dienst; deelt de view-transition-naam met de kaart op de homepage.
              <ViewTransition name={serviceImageTransition(preService[0])} share="morph" default="none">
                <div className="relative mb-8 aspect-[16/9] max-w-[560px] overflow-hidden rounded-[18px] border border-line bg-graphite md:mb-10">
                  <Image
                    src={headerPhoto.src}
                    alt={headerPhoto.alt}
                    fill
                    preload
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="object-cover"
                  />
                  {preService[0] === "window-tinting" && (
                    <TintProvider initial={preTint ?? DEFAULT_TINT}>
                      <TintOverlay />
                    </TintProvider>
                  )}
                </div>
              </ViewTransition>
            )}
            <h1 className="display text-chrome text-[60px] md:text-[88px]">Offerte aanvragen</h1>
            <p className="mt-5 max-w-[40ch] text-[17px] text-mute">
              Een paar gegevens is genoeg. We nemen contact met je op om de details en een datum te bespreken.
            </p>
            {preFinish && (
              <p className="chip mt-6 !text-paper">
                Gekozen afwerking: <strong className="font-medium">{finishes[preFinish].name}</strong>
              </p>
            )}
            {preTint && (
              <p className="chip mt-6 !text-paper">
                Gekozen tint: <strong className="font-medium tabular-nums">{preTint}%</strong>
              </p>
            )}

            <div className="mt-10 hidden border-t border-line pt-8 lg:block">
              <p className="eyebrow !text-[13px] !text-mute-2">Wat gebeurt er hierna?</p>
              <ol className="mt-5 space-y-4">
                {NEXT_STEPS.map((s, i) => (
                  <li key={s} className="flex items-start gap-4 text-[15px] text-mute">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-strong font-display text-[14px] font-semibold text-accent">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {(site.contact.phone || site.contact.email) && (
              <div className="mt-10 hidden border-t border-line pt-6 text-[15px] text-mute lg:block">
                <p>Liever direct contact?</p>
                {site.contact.phone && (
                  <a href={telHref(site.contact.phone)} className="link-line text-paper">
                    {site.contact.phone}
                  </a>
                )}
                {site.contact.email && (
                  <a href={`mailto:${site.contact.email}`} className="link-line block text-paper">
                    {site.contact.email}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="card p-6 sm:p-8 md:p-10">
            <QuoteForm
              initial={{ ...emptyQuoteFields, services: preService, finish: preFinish, message: preMessage }}
              submissionId={randomUUID()}
              minDate={todayIso()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
