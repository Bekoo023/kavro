import Link from "next/link";
import { services } from "@/config/services";
import { requireAdmin } from "@/lib/auth";
import { getStorage, type Project } from "@/lib/storage";
import { setPublished } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: PageProps<"/beheer/projecten">) {
  await requireAdmin();
  const sp = await searchParams;
  let projects: Project[] = [];
  let loadError: string | null = null;
  try {
    projects = await (await getStorage()).listProjects();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Onbekende fout";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[26px] font-medium">Projecten</h1>
        <Link href="/beheer/projecten/nieuw" className="btn-primary !min-h-[42px]">
          Nieuw project
        </Link>
      </div>
      <p className="mt-2 max-w-[70ch] text-mute">
        Gepubliceerde projecten verschijnen onder &lsquo;Ons werk&rsquo; op de homepage. Zonder gepubliceerde projecten is die sectie
        verborgen.
      </p>
      {sp.opgeslagen && (
        <p role="status" className="mt-4 text-ok">
          Project opgeslagen.
        </p>
      )}
      {loadError && (
        <p role="alert" className="mt-6 border border-danger/60 bg-danger/10 p-4">
          Projecten konden niet worden geladen: {loadError}
        </p>
      )}
      {!loadError && projects.length === 0 && <p className="mt-8 text-mute">Nog geen projecten.</p>}
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {projects.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">
                {p.title}{" "}
                <span className={p.published ? "text-ok" : "text-mute-2"}>· {p.published ? "Gepubliceerd" : "Verborgen"}</span>
              </p>
              <p className="text-[14px] text-mute">
                {p.type} · {p.aspect}
                {p.service && <> · {services[p.service]?.name}</>}
                {p.vehicle && <> · {p.vehicle}</>} · volgorde {p.sortOrder}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <form action={setPublished}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="published" value={p.published ? "false" : "true"} />
                <button type="submit" className="min-h-[40px] border border-line-strong px-3 hover:border-paper">
                  {p.published ? "Verbergen" : "Publiceren"}
                </button>
              </form>
              <Link href={`/beheer/projecten/${p.id}`} className="min-h-[40px] content-center px-2 underline underline-offset-4">
                Bewerken
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
