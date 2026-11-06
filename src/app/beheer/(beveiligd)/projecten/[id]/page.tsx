import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { deleteProject } from "../../../actions";
import { ProjectForm } from "../project-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: PageProps<"/beheer/projecten/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const project = await (await getStorage()).getProject(id);
  if (!project) notFound();

  return (
    <div>
      <Link href="/beheer/projecten" className="inline-flex min-h-9 items-center text-[14px] text-mute hover:text-paper">
        ← Projecten
      </Link>
      <h1 className="display mt-4 mb-8 text-[40px] md:text-[52px]">Project bewerken</h1>
      <ProjectForm project={project} />

      <details className="mt-12 max-w-[640px] rounded-2xl border border-line bg-graphite p-5">
        <summary className="cursor-pointer list-none text-[14px] text-mute hover:text-paper [&::-webkit-details-marker]:hidden">Project verwijderen…</summary>
        <form action={deleteProject} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={project.id} />
          <label className="flex cursor-pointer items-start gap-2.5 text-[14px] text-mute">
            <input type="checkbox" name="confirm" required className="mt-1 accent-[var(--color-danger)]" />
            Ja, verwijder dit project definitief. De bestanden zelf blijven bestaan.
          </label>
          <button type="submit" className="min-h-[40px] rounded-full border border-danger/50 px-4 text-[14px] text-danger transition-colors hover:bg-danger/10">
            Project verwijderen
          </button>
        </form>
      </details>
    </div>
  );
}
