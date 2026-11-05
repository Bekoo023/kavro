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
      <h1 className="mb-6 text-[26px] font-medium">Project bewerken</h1>
      <ProjectForm project={project} />
      <form action={deleteProject} className="mt-14 max-w-2xl border-t border-line pt-6">
        <input type="hidden" name="id" value={project.id} />
        <p className="font-medium">Project verwijderen</p>
        <label className="mt-3 flex items-center gap-3 text-mute">
          <input type="checkbox" name="confirm" required className="h-5 w-5" />
          Ja, verwijder dit project definitief
        </label>
        <button type="submit" className="mt-4 min-h-[42px] border border-danger/70 px-4 text-danger hover:bg-danger/10">
          Verwijderen
        </button>
      </form>
    </div>
  );
}
