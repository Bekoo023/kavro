import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { requireAdmin } from "@/lib/auth";
import { getStorage, StorageNotConfiguredError } from "@/lib/storage";
import { AdminNav, NavIcon } from "../_components/admin-nav";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Schil van het beheer: vaste zijbalk op desktop, compacte balk bovenaan op mobiel.
 * Het getal bij "Aanvragen" toont hoeveel nieuwe aanvragen nog op een reactie wachten.
 */
export default async function ProtectedLayout({ children }: LayoutProps<"/beheer">) {
  await requireAdmin();

  let storageNote: string | null = null;
  let storageError = false;
  let newCount = 0;
  try {
    const s = await getStorage();
    if (s.driver === "file" && process.env.NODE_ENV === "production") {
      storageNote = "Opslag: bestand op de server. Alleen geschikt bij een blijvende schijf.";
    } else if (s.driver === "file") {
      storageNote = "Opslag: lokaal bestand (ontwikkeling).";
    }
    newCount = (await s.listRequests()).filter((r) => r.status === "nieuw").length;
  } catch (err) {
    storageNote = err instanceof StorageNotConfiguredError ? err.message : "Opslag is niet bereikbaar.";
    storageError = true;
  }

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-line bg-graphite/95 backdrop-blur lg:h-svh lg:border-r lg:border-b-0 lg:bg-graphite">
        <div className="flex h-full flex-col gap-3 px-3 py-3 lg:gap-8 lg:px-4 lg:py-6">
          <div className="flex items-center justify-between gap-3 px-2">
            <Link href="/beheer" className="flex items-center gap-2.5" aria-label="Kavro beheer, overzicht">
              <BrandLogo className="h-4" />
              <span className="rounded-md border border-line-strong px-1.5 py-px text-[11px] tracking-[0.12em] text-mute-2 uppercase">Beheer</span>
            </Link>
            <form action={logout} className="lg:hidden">
              <button type="submit" className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-[14px] text-mute hover:text-paper">
                <NavIcon name="logout" />
                <span className="sr-only">Uitloggen</span>
              </button>
            </form>
          </div>

          <div className="-mx-3 overflow-x-auto px-3 lg:mx-0 lg:overflow-visible lg:px-0">
            <AdminNav newCount={newCount} />
          </div>

          <div className="mt-auto hidden flex-col gap-1 border-t border-line pt-4 lg:flex">
            <Link
              href="/"
              target="_blank"
              className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-[14.5px] text-mute hover:bg-white/[0.04] hover:text-paper"
            >
              <NavIcon name="external" className="text-mute-2" />
              Bekijk website
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-[14.5px] text-mute hover:bg-white/[0.04] hover:text-paper"
              >
                <NavIcon name="logout" className="text-mute-2" />
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        {storageNote && (
          <p
            role={storageError ? "alert" : undefined}
            className={`border-b border-line px-5 py-2.5 text-[14px] lg:px-10 ${storageError ? "bg-danger/8 text-danger" : "text-mute-2"}`}
          >
            {storageNote}
          </p>
        )}
        <div className="mx-auto max-w-[1180px] px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
