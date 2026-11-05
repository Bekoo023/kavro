import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { BrandLogo } from "@/components/brand-logo";
import { quoteHref, services } from "@/config/services";
import { filledSocials, hasAddress, site, telHref } from "@/config/site";

export function SiteFooter() {
  const socials = filledSocials();
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-line bg-graphite">
      <div className="wrap grid gap-12 pt-16 pb-12 md:grid-cols-12 md:pt-20">
        <div className="md:col-span-5">
          <BrandLogo className="h-7" />
          <p className="mt-4 max-w-[34ch] text-mute">PPF, chrome delete en window tinting.</p>
          <Link href="/offerte" className="btn-primary mt-8">
            Offerte aanvragen
            <Arrow />
          </Link>
        </div>

        <div className="text-[15px] md:col-span-3">
          <p className="eyebrow mb-4 !text-[13px] !text-mute-2">Diensten</p>
          <ul className="space-y-1">
            {Object.values(services).map((s) => (
              <li key={s.slug}>
                <Link className="inline-flex min-h-[36px] items-center text-mute transition-colors hover:text-paper" href={quoteHref({ service: s.slug })}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[15px] md:col-span-4">
          {(site.contact.email || site.contact.phone || hasAddress() || site.serviceArea) && (
            <>
              <p className="eyebrow mb-4 !text-[13px] !text-mute-2">Contact</p>
              <ul className="space-y-1.5 text-mute">
                {site.contact.phone && (
                  <li>
                    <a className="hover:text-paper" href={telHref(site.contact.phone)}>
                      {site.contact.phone}
                    </a>
                  </li>
                )}
                {site.contact.email && (
                  <li>
                    <a className="hover:text-paper" href={`mailto:${site.contact.email}`}>
                      {site.contact.email}
                    </a>
                  </li>
                )}
                {hasAddress() && (
                  <li>
                    {site.address.street}, {site.address.postalCode} {site.address.city}
                  </li>
                )}
                {site.serviceArea && <li>Werkgebied: {site.serviceArea}</li>}
              </ul>
            </>
          )}
          {site.openingHours.length > 0 && (
            <>
              <p className="eyebrow mt-8 mb-4 !text-[13px] !text-mute-2">Openingstijden</p>
              <dl className="space-y-1.5 text-mute">
                {site.openingHours.map((o) => (
                  <div key={o.days} className="flex justify-between gap-4">
                    <dt>{o.days}</dt>
                    <dd className="tabular-nums">{o.hours}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {!site.contact.email && !site.contact.phone && !hasAddress() && !site.serviceArea && site.openingHours.length === 0 && (
            <>
              <p className="eyebrow mb-4 !text-[13px] !text-mute-2">Navigatie</p>
              <ul className="space-y-1">
                {[
                  ["/#werkwijze", "Werkwijze"],
                  ["/#faq", "Veelgestelde vragen"],
                  ["/offerte", "Offerte aanvragen"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link className="inline-flex min-h-[36px] items-center text-mute transition-colors hover:text-paper" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Grote woordmerk-uitloop */}
      <div aria-hidden="true" className="wrap pointer-events-none -mb-[2vw] pt-6">
        <BrandLogo decorative className="h-auto w-full opacity-[0.06]" />
      </div>

      <div className="wrap relative flex flex-wrap items-center justify-between gap-3 border-t border-line py-6 text-[14px] text-mute-2">
        <p>
          © {year} {site.name}
          {site.kvk && <> · KvK {site.kvk}</>}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {socials.map((s) => (
            <a key={s.key} className="hover:text-paper" href={s.href} rel="noopener noreferrer" target="_blank">
              {s.label}
            </a>
          ))}
          <Link href="/privacy" className="hover:text-paper">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
