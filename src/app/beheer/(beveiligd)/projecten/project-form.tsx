"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { services, SERVICE_SLUGS, type ServiceSlug } from "@/config/services";
import { ASPECTS, PROJECT_TYPES, type Aspect, type Project, type ProjectType } from "@/lib/storage/types";
import { saveProject, type ProjectFormState } from "../../actions";

const typeLabels: Record<ProjectType, string> = { foto: "Foto", video: "Video", "voor-na": "Voor / na" };
const typeHints: Record<ProjectType, string> = {
  foto: "Eén sterke foto van het resultaat.",
  video: "Korte video zonder geluid (mp4), met een posterbeeld dat eerst laadt.",
  "voor-na": "Twee foto's met exact dezelfde uitsnede; bezoekers schuiven ertussen.",
};

/**
 * Projectformulier met live voorbeeld: links de velden, rechts hoe het project
 * onder 'Ons werk' op de site komt te staan.
 */
export function ProjectForm({ project }: { project: Project | null }) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProject.bind(null, project?.id ?? null), {});
  const v = state.values;
  const init = (k: keyof Project, fallback = "") =>
    v?.[k] ?? (project && project[k] !== null && project[k] !== undefined ? String(project[k]) : fallback);
  const e = state.errors ?? {};

  const [title, setTitle] = useState(init("title"));
  const [service, setService] = useState(init("service"));
  const [vehicle, setVehicle] = useState(init("vehicle"));
  const [description, setDescription] = useState(init("description"));
  const [type, setType] = useState<ProjectType>(init("type", "foto") as ProjectType);
  const [aspect, setAspect] = useState<Aspect>(init("aspect", "3/2") as Aspect);
  const [imageSrc, setImageSrc] = useState(init("imageSrc"));
  const [videoSrc, setVideoSrc] = useState(init("videoSrc"));
  const [beforeSrc, setBeforeSrc] = useState(init("beforeSrc"));
  const [afterSrc, setAfterSrc] = useState(init("afterSrc"));
  const [imageAlt, setImageAlt] = useState(init("imageAlt"));
  const [published, setPublished] = useState(v ? v.published === "on" : (project?.published ?? false));

  return (
    <form action={action} noValidate className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {state.formError && (
          <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4">
            {state.formError}
          </p>
        )}

        <Section title="Over het project">
          <Text label="Titel" name="title" value={title} onChange={setTitle} error={e.title} placeholder="Bijv. Volledige voorkant in PPF" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="service" className="text-[14px] font-medium">
                Dienst
              </label>
              <select id="service" name="service" value={service} onChange={(ev) => setService(ev.target.value)} className="field mt-2">
                <option value="">Geen</option>
                {SERVICE_SLUGS.map((s) => (
                  <option key={s} value={s}>
                    {services[s].name}
                  </option>
                ))}
              </select>
            </div>
            <Text label="Auto" optional name="vehicle" value={vehicle} onChange={setVehicle} error={e.vehicle} placeholder="Bijv. BMW M3 Competition" />
          </div>
          <div>
            <label htmlFor="description" className="text-[14px] font-medium">
              Korte beschrijving <span className="font-normal text-mute-2">(optioneel)</span>
            </label>
            <textarea id="description" name="description" rows={3} maxLength={800} value={description} onChange={(ev) => setDescription(ev.target.value)} className="field mt-2" />
          </div>
        </Section>

        <Section title="Beeld">
          <fieldset>
            <legend className="text-[14px] font-medium">Soort</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PROJECT_TYPES.map((t) => (
                <label key={t} className="choice !min-h-[48px] justify-center">
                  <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                  <span className="text-[14.5px]">{typeLabels[t]}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-mute-2">{typeHints[type]}</p>
          </fieldset>

          <fieldset>
            <legend className="text-[14px] font-medium">Beeldverhouding</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ASPECTS.map((a) => {
                const [w, h] = a.split("/").map(Number);
                return (
                  <label key={a} className="choice !min-h-[52px] !gap-2.5 !px-3.5">
                    <input type="radio" name="aspect" value={a} checked={aspect === a} onChange={() => setAspect(a)} className="sr-only" />
                    <span aria-hidden="true" className="rounded-[3px] border border-current opacity-70" style={{ width: (22 * w) / Math.max(w, h), height: (22 * h) / Math.max(w, h) }} />
                    <span className="text-[14px] tabular-nums">{a.replace("/", ":")}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="rounded-xl border border-line bg-ink/60 p-4 text-[13.5px] text-mute">
            Zet bestanden in <code className="text-paper">public/media/projecten/</code> en vul het pad in, bijv.{" "}
            <code className="text-paper">/media/projecten/golf-ppf.jpg</code>. Een https-adres kan ook. Het voorbeeld rechts laat direct zien of het pad klopt.
          </div>

          {type !== "voor-na" && (
            <Text
              label={type === "video" ? "Posterbeeld" : "Foto"}
              optional={type === "video"}
              name="imageSrc"
              value={imageSrc}
              onChange={setImageSrc}
              error={e.imageSrc}
              placeholder="/media/projecten/…"
            />
          )}
          {type === "video" && <Text label="Video (mp4)" name="videoSrc" value={videoSrc} onChange={setVideoSrc} error={e.videoSrc} placeholder="/media/projecten/….mp4" />}
          {type === "voor-na" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Text label="Voor" name="beforeSrc" value={beforeSrc} onChange={setBeforeSrc} error={e.beforeSrc} placeholder="/media/projecten/…-voor.jpg" />
              <Text label="Na (zelfde uitsnede)" name="afterSrc" value={afterSrc} onChange={setAfterSrc} error={e.afterSrc} placeholder="/media/projecten/…-na.jpg" />
            </div>
          )}
          {/* Velden van andere soorten blijven bewaard bij wisselen. */}
          {type === "voor-na" && <input type="hidden" name="imageSrc" value={imageSrc} />}
          {type !== "video" && <input type="hidden" name="videoSrc" value={videoSrc} />}
          {type !== "voor-na" && (
            <>
              <input type="hidden" name="beforeSrc" value={beforeSrc} />
              <input type="hidden" name="afterSrc" value={afterSrc} />
            </>
          )}
          <Text
            label="Wat staat er op het beeld?"
            hint="Voor schermlezers en Google. Bijv. ‘Zwarte BMW M3 met transparante folie op de motorkap’."
            name="imageAlt"
            value={imageAlt}
            onChange={setImageAlt}
            error={e.imageAlt}
          />
        </Section>

        <Section title="Publicatie">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line-strong bg-ink px-4 py-3.5">
            <span>
              <span className="block text-[15px] font-medium">Tonen op de website</span>
              <span className="block text-[13px] text-mute-2">Onder &lsquo;Ons werk&rsquo; op de homepage.</span>
            </span>
            <input type="checkbox" name="published" checked={published} onChange={(ev) => setPublished(ev.target.checked)} className="peer sr-only" />
            <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-graphite-3 transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-paper after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-ink" />
          </label>
          <div className="max-w-[220px]">
            <Text label="Volgorde" hint="Laag = eerst." name="sortOrder" type="number" value={init("sortOrder", "0")} error={e.sortOrder} />
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Opslaan…" : project ? "Wijzigingen opslaan" : "Project opslaan"}
          </button>
          <Link href="/beheer/projecten" className="px-3 text-[14.5px] text-mute hover:text-paper">
            Annuleren
          </Link>
        </div>
      </div>

      {/* Live voorbeeld */}
      <aside aria-label="Voorbeeld op de website" className="lg:sticky lg:top-8 lg:self-start">
        <p className="text-[13px] text-mute-2">Voorbeeld op de website</p>
        <div className="mt-3 rounded-2xl border border-line bg-ink p-4">
          <PreviewMedia type={type} aspect={aspect} imageSrc={imageSrc} beforeSrc={beforeSrc} afterSrc={afterSrc} alt={imageAlt} />
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="display text-[26px]">{title || "Titel van het project"}</p>
            <p className="text-[12.5px] text-mute-2">
              {[vehicle, service ? services[service as ServiceSlug]?.name : null].filter(Boolean).join(" · ")}
            </p>
          </div>
          {description && <p className="mt-1.5 text-[13.5px] text-mute">{description}</p>}
        </div>
        <p className={`mt-3 flex items-center gap-2 text-[13px] ${published ? "text-ok" : "text-mute-2"}`}>
          <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${published ? "bg-ok" : "bg-mute-2"}`} />
          {published ? "Wordt getoond op de website" : "Verborgen, alleen zichtbaar in beheer"}
        </p>
      </aside>
    </form>
  );
}

function PreviewMedia({ type, aspect, imageSrc, beforeSrc, afterSrc, alt }: { type: ProjectType; aspect: Aspect; imageSrc: string; beforeSrc: string; afterSrc: string; alt: string }) {
  const style = { aspectRatio: aspect.replace("/", " / ") };
  const frame = "relative w-full overflow-hidden rounded-[14px] border border-line bg-graphite";
  if (type === "voor-na") {
    return (
      <div className={frame} style={style}>
        <PreviewImg src={beforeSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-y-0 right-0 left-1/2 overflow-hidden">
          <PreviewImg src={afterSrc} alt="" className="absolute inset-y-0 right-0 h-full w-[200%] max-w-none object-cover" />
        </div>
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-paper" />
        <span className="chip absolute top-2 left-2 !min-h-6 !px-2 !text-[11px]">Voor</span>
        <span className="chip absolute top-2 right-2 !min-h-6 !px-2 !text-[11px]">Na</span>
      </div>
    );
  }
  return (
    <div className={frame} style={style}>
      <PreviewImg src={imageSrc} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      {type === "video" && (
        <span aria-hidden="true" className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-paper">
          ▶
        </span>
      )}
    </div>
  );
}

/** Toont het beeld, of een duidelijke melding als het pad leeg of onjuist is. */
function PreviewImg({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const ok = src && (src.startsWith("/") || src.startsWith("https://"));
  if (!ok || failed === src) {
    return (
      <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-[12.5px] text-mute-2">
        {!src ? "Nog geen beeld" : failed === src ? "Beeld niet gevonden op dit pad" : "Pad moet met / of https:// beginnen"}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={src} src={src} alt={alt} className={className} onError={() => setFailed(src)} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-graphite p-5 md:p-6">
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Text({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  optional,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange?: (v: string) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const describedBy = [hint ? `${name}-hulp` : null, error ? `${name}-fout` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={name} className="text-[14px] font-medium">
        {label} {optional && <span className="font-normal text-mute-2">(optioneel)</span>}
      </label>
      {hint && (
        <p id={`${name}-hulp`} className="mt-1 text-[13px] text-mute-2">
          {hint}
        </p>
      )}
      <input
        id={name}
        name={name}
        type={type}
        {...(onChange ? { value, onChange: (ev: React.ChangeEvent<HTMLInputElement>) => onChange(ev.target.value) } : { defaultValue: value })}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="field mt-2"
      />
      {error && (
        <p id={`${name}-fout`} className="mt-1.5 text-[13.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
