import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { requireAdmin } from "@/lib/auth";
import { getStorage, StorageNotConfiguredError } from "@/lib/storage";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: LayoutProps<"/beheer">) {
  await requireAdmin();

  let storageNote: string | null = null;
  try {
    const s = await getStorage();
    if (s.driver === "file" && process.env.NODE_ENV === "production") {
      storageNote = "Opslag: bestand op de server. Alleen geschikt bij een blijvende schijf.";
    } else if (s.driver === "file") {
      storageNote = "Opslag: lokaal bestand (ontwikkeling).";
    }
  } catch (err) {
    storageNote = err instanceof StorageNotConfiguredError ? err.message : "Opslag is niet bereikbaar.";
  }

  return (
    <>
      <header className="border-b border-line bg-graphite">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <BrandLogo className="h-4" />
            </Link>
            <nav aria-label="Beheer" className="flex gap-4">
              <Link href="/beheer" className="hover:underline">
                Aanvragen
              </Link>
              <Link href="/beheer/projecten" className="hover:underline">
                Projecten
              </Link>
            </nav>
          </div>
          <form action={logout}>
            <button type="submit" className="text-mute hover:text-paper">
              Uitloggen
            </button>
          </form>
        </div>
      </header>
      {storageNote && (
        <p className="mx-auto max-w-6xl px-5 pt-4 text-[14px] text-mute-2">{storageNote}</p>
      )}
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </>
  );
}
