import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { authConfigError, isAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/beheer");
  const configError = authConfigError();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="h-5" />
          <span className="rounded-md border border-line-strong px-1.5 py-px text-[11px] tracking-[0.12em] text-mute-2 uppercase">Beheer</span>
        </div>
        <div className="card mt-8 p-6 sm:p-8">
          <h1 className="display text-[40px]">Inloggen</h1>
          <p className="mt-2 text-[14.5px] text-mute">Aanvragen, agenda en projecten van Kavro.</p>
          {configError ? (
            <div role="alert" className="mt-6 rounded-xl border border-danger/50 bg-danger/10 p-4">
              <p className="font-medium">Beheer is nog niet ingesteld.</p>
              <p className="mt-2 text-[14px] text-mute">{configError} Zet deze variabelen in .env (lokaal) of bij je hostingpartij.</p>
            </div>
          ) : (
            <LoginForm />
          )}
        </div>
        <Link href="/" className="mt-6 inline-block text-[14px] text-mute hover:text-paper">
          ← Terug naar de website
        </Link>
      </div>
    </div>
  );
}
