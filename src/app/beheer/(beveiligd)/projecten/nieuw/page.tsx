import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="mb-6 text-[26px] font-medium">Nieuw project</h1>
      <ProjectForm project={null} />
    </div>
  );
}
