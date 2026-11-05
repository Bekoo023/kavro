"use client";

import { useActionState, useState } from "react";
import { services, SERVICE_SLUGS } from "@/config/services";
import { ASPECTS, type Project } from "@/lib/storage/types";
import { saveProject, type ProjectFormState } from "../../actions";

const typeLabels = { foto: "Foto", video: "Video", "voor-na": "Voor/na" } as const;

export function ProjectForm({ project }: { project: Project | null }) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProject.bind(null, project?.id ?? null), {});
  const v = state.values;
  const val = (k: keyof Project, fallback = "") =>
    v?.[k] ?? (project && project[k] !== null && project[k] !== undefined ? String(project[k]) : fallback);
  const [type, setType] = useState(val("type", "foto"));
  const e = state.errors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-6" noValidate>
      {state.formError && (
        <p role="alert" className="border border-danger/60 bg-danger/10 p-3">
          {state.formError}
        </p>
      )}
      <Field label="Titel" name="title" defaultValue={val("title")} error={e.title} />
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="service" className="block font-medium">
            Dienst
          </label>
          <select id="service" name="service" defaultValue={val("service")} className="field mt-2">
            <option value="">Geen</option>
            {SERVICE_SLUGS.map((s) => (
              <option key={s} value={s}>
                {services[s].name}
              </option>
            ))}
          </select>
        </div>
        <Field label="Auto (optioneel)" name="vehicle" defaultValue={val("vehicle")} error={e.vehicle} />
      </div>
      <div>
        <label htmlFor="description" className="block font-medium">
          Korte beschrijving (optioneel)
        </label>
        <textarea id="description" name="description" rows={3} defaultValue={val("description")} className="field mt-2" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block font-medium">
            Soort
          </label>
          <select id="type" name="type" value={type} onChange={(ev) => setType(ev.target.value)} className="field mt-2">
            {Object.entries(typeLabels).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="aspect" className="block font-medium">
            Beeldverhouding
          </label>
          <select id="aspect" name="aspect" defaultValue={val("aspect", "3/2")} className="field mt-2">
            {ASPECTS.map((a) => (
              <option key={a} value={a}>
                {a.replace("/", ":")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-line p-4">
        <p className="text-[14px] text-mute">
          Zet bestanden in <code className="text-paper">public/media/projecten/</code> en vul het pad in, bijvoorbeeld{" "}
          <code className="text-paper">/media/projecten/golf-ppf.jpg</code>. Een https-adres van je eigen opslag kan ook.
        </p>
        <div className="mt-4 space-y-5">
          {type !== "voor-na" && (
            <Field
              label={type === "video" ? "Posterbeeld (aanbevolen)" : "Foto"}
              name="imageSrc"
              defaultValue={val("imageSrc")}
              error={e.imageSrc}
            />
          )}
          {type === "video" && <Field label="Video (mp4)" name="videoSrc" defaultValue={val("videoSrc")} error={e.videoSrc} />}
          {type === "voor-na" && (
            <>
              <Field label="Voor-beeld" name="beforeSrc" defaultValue={val("beforeSrc")} error={e.beforeSrc} />
              <Field label="Na-beeld (zelfde uitsnede)" name="afterSrc" defaultValue={val("afterSrc")} error={e.afterSrc} />
            </>
          )}
          <Field label="Beschrijving van het beeld (alt-tekst)" name="imageAlt" defaultValue={val("imageAlt")} error={e.imageAlt} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Volgorde (laag = eerst)" name="sortOrder" type="number" defaultValue={val("sortOrder", "0")} error={e.sortOrder} />
        <label className="flex items-center gap-3 self-end pb-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={v ? v.published === "on" : (project?.published ?? false)}
            className="h-5 w-5 accent-[#f2f0ec]"
          />
          Publiceren op de website
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Bezig met opslaan…" : "Opslaan"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        key={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-fout` : undefined}
        className="field mt-2"
      />
      {error && (
        <p id={`${name}-fout`} className="mt-2 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
