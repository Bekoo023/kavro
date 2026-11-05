import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Hoe ${site.name} omgaat met gegevens uit het aanvraagformulier.`,
};

// Basistekst. Laat deze nalopen en vul aan met je eigen bedrijfsgegevens vóór livegang.
export default function PrivacyPage() {
  return (
    <div className="wrap max-w-[760px] pt-12 pb-24 md:pt-24 md:pb-32">
      <h1 className="display text-chrome text-[60px] md:text-[88px]">Privacy</h1>
      <div className="mt-8 space-y-5 text-mute [&_h2]:mt-10 [&_h2]:text-[18px] [&_h2]:font-medium [&_h2]:text-paper">
        <p>
          Deze pagina beschrijft welke gegevens {site.name} verwerkt als je via deze website een offerte of afspraak aanvraagt.
        </p>
        <h2>Welke gegevens</h2>
        <p>
          De gekozen dienst en afwerking, het merk en model van je auto, je naam, je e-mailadres en/of telefoonnummer, en
          optioneel een toelichting en voorkeursdatum.
        </p>
        <h2>Waarvoor</h2>
        <p>Alleen om contact met je op te nemen over je aanvraag en een eventuele afspraak in te plannen.</p>
        <h2>Delen en bewaren</h2>
        <p>
          We verkopen je gegevens niet. Ze worden opgeslagen bij de hostingpartij van deze website en, als e-mailmeldingen
          aanstaan, verstuurd via een e-maildienst. We bewaren ze niet langer dan nodig voor je aanvraag en een eventuele
          opdracht.
        </p>
        <h2>Je rechten</h2>
        <p>
          Je kunt vragen om inzage, correctie of verwijdering van je gegevens
          {site.contact.email ? (
            <>
              {" "}via <a className="text-paper underline underline-offset-4" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </>
          ) : null}
          .
        </p>
      </div>
    </div>
  );
}
