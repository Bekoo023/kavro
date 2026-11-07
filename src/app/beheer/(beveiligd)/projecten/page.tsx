import Link from "next/link";
import { serviceName } from "@/config/services";
import { requireAdmin } from "@/lib/auth";
import { getStorage, type Project } from "@/lib/storage";
import { setPublished } from "../../actions";

export const dynamic = "force-dynamic";

const typeLabels = { foto: "Foto", video: "Video", "voor-na": "Voor / na" } as const;

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
  const live = projects.filter((p) => p.published).length;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[44px] md:text-[56px]">Projecten</h1>
          <p className="mt-1 max-w-[62ch] text-[14.5px] text-mute">
            Gepubliceerde projecten staan onder &lsquo;Ons werk&rsquo; op de homepage
            {projects.length > 0 && (
              <>
                {" "}
                · <span className="text-paper">{live}</span> van {projects.length} online
              </>
            )}
            . Zonder gepubliceerde projecten is die sectie verborgen.
          </p>
        </div>
        <Link href="/beheer/projecten/nieuw" className="btn-primary !min-h-[44px] !px-5 text-[14px]">
          + Nieuw project
        </Link>
      </header>

      {sp.opgeslagen && (
        <p role="status" className="mt-6 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3 text-[14.5px] text-ok">
          Project opgeslagen.
        </p>
      )}
      {loadError && (
        <p role="alert" className="mt-6 rounded-2xl border border-danger/50 bg-danger/10 p-4">
          Projecten konden niet worden geladen: {loadError}
        </p>
      )}

      {!loadError && projects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="display text-[30px]">Nog geen projecten</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-mute">
            Laat zien wat je hebt gedaan: een foto, een korte video of een voor/na-vergelijking. Echte auto&rsquo;s overtuigen meer dan
            welke tekst ook.
          </p>
          <Link href="/beheer/projecten/nieuw" className="btn-primary mt-6 !min-h-[44px] !px-5 text-[14px]">
            Eerste project toevoegen
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-graphite">
              <Link href={`/beheer/projecten/${p.id}`} className="group relative block aspect-[4/3] overflow-hidden bg-ink">
                <Thumb p={p} />
                <span className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`chip !min-h-6 !px-2.5 !text-[12px] ${p.published ? "!text-ok" : ""}`}>
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${p.published ? "bg-ok" : "bg-mute-2"}`} />
                    {p.published ? "Online" : "Verborgen"}
                  </span>
                  <span className="chip !min-h-6 !px-2.5 !text-[12px]">{typeLabels[p.type]}</span>
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link href={`/beheer/projecten/${p.id}`} className="text-[16px] font-semibold decoration-accent underline-offset-4 hover:underline">
                  {p.title}
                </Link>
                <p className="mt-1 text-[13px] text-mute">
                  {[p.vehicle, p.service ? serviceName(p.service) : null].filter(Boolean).join(" · ") || "Geen dienst of auto"}
                  <span className="text-mute-2"> · volgorde {p.sortOrder}</span>
                </p>
                <div className="mt-auto flex items-center gap-2 pt-4">
                  <form action={setPublished}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="published" value={p.published ? "false" : "true"} />
                    <button
                      type="submit"
                      className="min-h-9 rounded-full border border-line-strong px-3.5 text-[13.5px] transition-colors hover:border-paper/60 hover:bg-white/[0.04]"
                    >
                      {p.published ? "Verbergen" : "Publiceren"}
                    </button>
                  </form>
                  <Link href={`/beheer/projecten/${p.id}`} className="min-h-9 content-center rounded-full bg-white/[0.07] px-3.5 text-[13.5px] hover:bg-white/[0.12]">
                    Bewerken
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Thumb({ p }: { p: Project }) {
  const src = p.type === "voor-na" ? p.afterSrc : p.imageSrc;
  if (!src) {
    return <span className="absolute inset-0 flex items-center justify-center text-[13px] text-mute-2">{p.type === "video" ? "Video zonder poster" : "Geen beeld"}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
  );
}
