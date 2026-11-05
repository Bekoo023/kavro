import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { authConfigError, isAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/beheer");
  const configError = authConfigError();
  return (
    <div className="mx-auto max-w-sm px-5 pt-24">
      <BrandLogo className="h-5" />
      <h1 className="mt-6 text-[24px] font-medium">Beheer</h1>
      {configError ? (
        <div role="alert" className="mt-6 border border-danger/60 bg-danger/10 p-4">
          <p className="font-medium">Beheer is nog niet ingesteld.</p>
          <p className="mt-2 text-mute">{configError} Zet deze variabelen in .env.local (lokaal) of bij je hostingpartij.</p>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
