import { ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Arrow } from "@/components/arrow";
import { Hero } from "@/components/hero/hero";
import { TrimArtwork } from "@/components/art/trim-artwork";
import { PpfArtwork } from "@/components/art/service-art";
import { PpfSheen } from "@/components/art/ppf-sheen";
import { Faq } from "@/components/faq";
import { Marquee } from "@/components/marquee";
import { PortfolioGrid } from "@/components/portfolio";
import { ProcessSteps } from "@/components/process-steps";
import { Transformation } from "@/components/transformation";
import { media, serviceImageTransition, type PhotoAsset } from "@/config/media";
import { quoteHref, services, type ServiceSlug } from "@/config/services";
import { hasAddress, site, telHref } from "@/config/site";
import { getPublishedProjectsSafe } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MARQUEE = ["Paint Protection Film", "Chrome Delete", "Satijnzwart", "Steenslagbescherming", "Lakbescherming", "Omkeerbaar"];

const STEPS = [
  { title: "Aanvraag", text: "Vul het formulier in met je auto en wat je wilt laten doen. Dat kost een paar minuten." },
  { title: "Advies & offerte", text: "We nemen contact met je op, bespreken de mogelijkheden en sturen een heldere offerte." },
  { title: "Afspraak", text: "We plannen samen een datum in die jou uitkomt." },
  { title: "Oplevering", text: "We werken alles netjes af en lopen het resultaat samen met je door." },
];

const VALUES = [
  { title: "Oog voor randen", text: "Folie wordt op maat gemaakt en zorgvuldig langs randen en naden ingelegd." },
  { title: "Omkeerbaar", text: "Folie ligt over het origineel heen. Wil je later terug, dan kan dat." },
  { title: "Eerlijk advies", text: "We vertellen vooraf wat wel en niet kan, ook als iets niet nodig is." },
  { title: "Duidelijke offerte", text: "Je weet vooraf waar je aan toe bent, zonder verrassingen achteraf." },
];

const FAQ = [
  {
    q: "Wat kost een behandeling?",
    a: "Dat hangt af van je auto, de dienst en hoeveel delen je wilt laten doen. Vraag vrijblijvend een offerte aan, dan krijg je een prijs die past bij jouw situatie.",
  },
  {
    q: "Kan chrome delete weer ongedaan gemaakt worden?",
    a: "Ja. Chrome delete doen we met folie, dus de originele lijsten blijven eronder bewaard.",
  },
  {
    q: "Op welke delen zet je PPF?",
    a: "Meestal op de delen die het meest te verduren krijgen, zoals de voorkant, spiegels en instaplijsten. Je kunt ook kiezen voor meer of minder.",
  },
  {
    q: "Hoe lang ben ik mijn auto kwijt?",
    a: "Dat verschilt per auto en per klus. Bij de offerte spreken we af hoe lang het duurt en wanneer je de auto terug hebt.",
  },
];

export default async function HomePage() {
  const projects = await getPublishedProjectsSafe();
  const hasWork = projects.length > 0;

  return (
    <>
      <LocalBusinessJsonLd />

      <Hero video={media.hero}>
        <h1 className="display max-w-[11ch] text-[64px] sm:text-[104px] lg:text-[clamp(104px,9.4vw,168px)]">
          <span className="intro-line">
            <span className="text-chrome">Strak tot</span>
          </span>
          <span className="intro-line">
            <span className="text-chrome" style={{ "--d": "110ms" } as React.CSSProperties}>
              in het detail
            </span>
          </span>
        </h1>
        <div className="mt-8 lg:mt-10">
          <div>
            <p className="intro-fade max-w-[44ch] text-[18px] leading-relaxed text-mute lg:text-[20px]" style={{ "--d": "560ms" } as React.CSSProperties}>
              PPF en chrome delete. Met aandacht voor elke rand en elke lijn van je auto.
            </p>
            <div className="intro-fade mt-8 flex flex-wrap items-center gap-3" style={{ "--d": "640ms" } as React.CSSProperties}>
              <Link href="/offerte" className="btn-primary">
                Vraag een offerte aan
                <Arrow />
              </Link>
              <Link href={hasWork ? "#werk" : "#diensten"} className="btn-ghost">
                {hasWork ? "Bekijk ons werk" : "Bekijk de diensten"}
              </Link>
            </div>
          </div>
        </div>
      </Hero>

      {/* LOPENDE BAND */}
      <Marquee words={MARQUEE} />

      {/* DIENSTEN */}
      <section id="diensten" aria-labelledby="diensten-titel" className="relative py-24 md:py-32 lg:py-40">
        <div className="wrap">
          <SectionHead
            id="diensten-titel"
            title="Wat we doen"
            text="Lak beschermen of chroom zwart maken. Twijfel je wat bij jouw auto past? Vraag het gerust."
          />

          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:gap-5">
            <ServiceCard slug="ppf" index={0} overlay={<PpfSheen />}>
              <PpfArtwork className="absolute inset-0 h-full w-full" />
            </ServiceCard>
            <ServiceCard slug="chrome-delete" index={1}>
              <TrimArtwork
                idPrefix="svc-chrome"
                camera="translate(800 500) scale(2.35) translate(-820 -470)"
                reflect={0.35}
                split={812}
                className="absolute inset-0 h-full w-full"
                title="Illustratie: raamomlijsting, links chroom en rechts satijnzwart"
              />
            </ServiceCard>
          </div>
        </div>
      </section>

      {/* TRANSFORMATIE: scroll-gestuurde overgang van chroom naar satijnzwart */}
      {media.transformation && <Transformation sequence={media.transformation} />}

      {/* PORTFOLIO: alleen zichtbaar met echte, gepubliceerde projecten */}
      {hasWork && (
        <section id="werk" aria-labelledby="werk-titel" className="py-24 md:py-32 lg:py-40">
          <div className="wrap">
            <SectionHead id="werk-titel" title="Ons werk" text="Een paar auto’s die we onlangs hebben gedaan." />
            <div className="mt-14 md:mt-20">
              <PortfolioGrid projects={projects} />
            </div>
          </div>
        </section>
      )}

      {/* WERKWIJZE */}
      <section id="werkwijze" aria-labelledby="werkwijze-titel" className={`py-24 md:py-32 lg:py-40 ${hasWork ? "border-t border-line" : ""}`}>
        <div className="wrap">
          <SectionHead
            id="werkwijze-titel"
            title="Hoe het werkt"
            text="Je aanvraag is zo gedaan. Daarna stemmen we alles samen met je af."
          />
          <div className="mt-14 md:mt-20 lg:grid lg:grid-cols-12 lg:gap-10">
            {/* Werkplaatsfoto naast de tijdlijn (alleen desktop, daar was de linkerkolom leeg). */}
            <div className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-[calc(var(--header-h)+48px)] overflow-hidden rounded-[24px] border border-line bg-graphite">
                <Image
                  src={media.atmosphere.workshop.src}
                  alt={media.atmosphere.workshop.alt}
                  width={media.atmosphere.workshop.width}
                  height={media.atmosphere.workshop.height}
                  sizes="(min-width: 1440px) 420px, 30vw"
                  className="aspect-[4/5] h-auto w-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ProcessSteps steps={STEPS} />
            </div>
          </div>
        </div>
      </section>

      {/* WAAROM */}
      <section aria-labelledby="waarom-titel" className="border-t border-line py-24 md:py-32 lg:py-40">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)]">
              <h2 id="waarom-titel" className="display text-[52px] md:text-[72px]">
                Waarom Kavro
              </h2>
              <p className="mt-6 max-w-[40ch] text-[17px] text-mute">
                We nemen de tijd voor elke auto, werken netjes en vertellen je eerlijk wat wel en niet kan.
              </p>
              <Link href="/offerte" className="btn-primary mt-8">
                Vraag een offerte aan
                <Arrow />
              </Link>
              {/* Detail van een folierand: bewijs bij 'Oog voor randen'. */}
              <div className="mt-10 overflow-hidden rounded-[24px] border border-line bg-graphite">
                <Image
                  src={media.atmosphere.edgeDetail.src}
                  alt={media.atmosphere.edgeDetail.alt}
                  width={media.atmosphere.edgeDetail.width}
                  height={media.atmosphere.edgeDetail.height}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="aspect-[4/3] h-auto w-full object-cover object-[50%_60%] lg:aspect-[5/4]"
                />
              </div>
            </div>
          </div>
          <ol className="border-t border-line lg:col-span-6 lg:col-start-7">
            {VALUES.map((v, i) => (
              <li
                key={v.title}
                style={{ "--i": i } as React.CSSProperties}
                className="reveal grid gap-2 border-b border-line py-7 md:grid-cols-[14rem_1fr] md:gap-8 md:py-9"
              >
                <h3 className="text-[19px] font-semibold md:text-[20px]">{v.title}</h3>
                <p className="max-w-[44ch] text-[16px] text-mute">{v.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-titel" className="border-t border-line py-24 md:py-32 lg:py-40">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="faq-titel" className="display text-[52px] md:text-[72px]">
              Veel&shy;gestelde vragen
            </h2>
            <p className="mt-6 max-w-[36ch] text-mute">Staat je vraag er niet tussen? Zet hem bij je offerteaanvraag, dan beantwoorden we hem.</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Faq items={FAQ} />
          </div>
        </div>
      </section>

      {/* AFSLUITENDE ACTIE */}
      <section aria-labelledby="cta-titel" className="pb-24 md:pb-32">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-[24px] border border-line px-6 py-16 md:px-16 md:py-24">
            <Image src={media.atmosphere.garage.src} alt="" fill sizes="(min-width: 1440px) 1312px, 100vw" className="object-cover object-[75%_50%]" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/15" />
            <div className="relative max-w-[640px]">
              <h2 id="cta-titel" className="display text-[52px] md:text-[88px]">
                Benieuwd wat het kost?
              </h2>
              <p className="mt-6 max-w-[46ch] text-[17px] text-mute">
                Vertel welke auto je hebt en wat je wilt laten doen. We nemen contact met je op om de mogelijkheden en een datum te
                bespreken.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/offerte" className="btn-primary">
                  Vraag een offerte aan
                  <Arrow />
                </Link>
                {site.contact.phone && (
                  <a href={telHref(site.contact.phone)} className="btn-ghost">
                    Bel {site.contact.phone}
                  </a>
                )}
                {site.contact.whatsapp && (
                  <a href={`https://wa.me/${site.contact.whatsapp}`} className="btn-ghost" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ id, title, text }: { id: string; title: React.ReactNode; text: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
      <div className="lg:col-span-7">
        <h2 id={id} className="display text-[52px] md:text-[80px]">
          {title}
        </h2>
      </div>
      <p className="max-w-[44ch] text-[17px] text-mute lg:col-span-4 lg:col-start-9 lg:pb-3">{text}</p>
    </div>
  );
}

/**
 * Compacte dienstkaart: beeld, naam, korte uitleg, kernpunten en een link naar de offerte.
 * Optioneel: `overlay` over de foto (schaalt mee met hover en parallax, bijv. de PPF-sheen).
 */
function ServiceCard({
  slug,
  index = 0,
  overlay,
  children,
}: {
  slug: ServiceSlug;
  index?: number;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}) {
  const s = services[slug];
  return (
    <article
      aria-labelledby={`dienst-${slug}`}
      style={{ "--i": index } as React.CSSProperties}
      className="card reveal group flex flex-col transition-colors hover:border-line-strong"
    >
      <div className="relative p-1.5">
        <div className="relative overflow-hidden rounded-[18px]">
          {/* Zelfde naam als de kopfoto op /offerte: bij "Offerte voor …" loopt het beeld door. */}
          <ViewTransition name={serviceImageTransition(slug)} share="morph" default="none">
            <ServiceFrame slug={slug} overlay={overlay} className="aspect-[4/3] rounded-[18px] md:aspect-[16/10]">
              {children}
            </ServiceFrame>
          </ViewTransition>
          {!media.services[slug] && <span className="chip absolute top-3 left-3">Illustratie</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
        <h3 id={`dienst-${slug}`} className="display text-[30px] md:text-[34px]">
          {s.name}
        </h3>
        <p className="mt-2 text-[15px] leading-snug text-mute md:min-h-[2.75em]">{s.summary}</p>
        <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[14px]">
          {s.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5">
              <Check className="mt-[3px]" />
              {p}
            </li>
          ))}
        </ul>
        <Link href={quoteHref({ service: slug })} className="link-line mt-auto self-start pt-4 text-[15px]">
          Offerte voor {s.short}
          <Arrow />
        </Link>
      </div>
    </article>
  );
}

function ServiceFrame({
  slug,
  className,
  overlay,
  children,
}: {
  slug: ServiceSlug;
  className: string;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}) {
  const photo: PhotoAsset | null = media.services[slug];
  return (
    <div className={`relative w-full overflow-hidden bg-graphite ${className}`}>
      {photo ? (
        <div className="parallax absolute inset-0">
          <div
            className="absolute inset-0"
            style={photo.crop ? { transform: `scale(${photo.crop.scale})`, transformOrigin: `${photo.crop.x * 100}% ${photo.crop.y * 100}%` } : undefined}
          >
            {/* Hover-zoom op een wrapper, zodat een overlay (PPF-sheen) exact meeschaalt met de foto. */}
            <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.05]">
              {/* Ingezoomd beeld heeft meer pixels nodig om scherp te blijven. */}
              <Image src={photo.src} alt={photo.alt} fill sizes={photo.crop ? "100vw" : "(min-width: 768px) 33vw, 100vw"} className="object-cover" />
              {overlay}
            </div>
          </div>
        </div>
      ) : (
        <div className="parallax absolute inset-0">
          <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]">{children}</div>
        </div>
      )}
    </div>
  );
}

function Check({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className={`shrink-0 text-accent ${className}`}>
      <path d="M2 7.5 L5.5 11 L12 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Alleen met ingevulde, echte bedrijfsgegevens. */
function LocalBusinessJsonLd() {
  if (!hasAddress() && !site.contact.phone && !site.contact.email) return null;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: site.name,
    url: site.url,
  };
  if (site.contact.phone) data.telephone = site.contact.phone;
  if (site.contact.email) data.email = site.contact.email;
  if (hasAddress()) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: "NL",
    };
  }
  if (site.serviceArea) data.areaServed = site.serviceArea;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
