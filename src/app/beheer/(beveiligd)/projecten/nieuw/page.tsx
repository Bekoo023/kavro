import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "../project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div>
      <Link href="/beheer/projecten" className="inline-flex min-h-9 items-center text-[14px] text-mute hover:text-paper">
        ← Projecten
      </Link>
      <h1 className="display mt-4 mb-8 text-[40px] md:text-[52px]">Nieuw project</h1>
      <ProjectForm project={null} />
    </div>
  );
}
