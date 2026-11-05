import "server-only";
import { StorageNotConfiguredError, type Storage } from "./types";

/**
 * Kiest de opslag:
 * - DATABASE_URL gezet           -> Postgres (aanbevolen voor productie)
 * - STORAGE_DRIVER=file          -> JSON-bestand in DATA_DIR (eigen server met blijvende schijf)
 * - ontwikkeling zonder config   -> JSON-bestand in ./data
 * - productie zonder config      -> StorageNotConfiguredError met duidelijke melding
 */
export async function getStorage(): Promise<Storage> {
  if (process.env.DATABASE_URL) {
    const { postgresStorage } = await import("./postgres");
    return postgresStorage;
  }
  if (process.env.STORAGE_DRIVER === "file" || process.env.NODE_ENV !== "production") {
    const { fileStorage } = await import("./file");
    return fileStorage;
  }
  throw new StorageNotConfiguredError(
    "Geen opslag geconfigureerd. Zet DATABASE_URL (Postgres) of, op een server met blijvende schijf, STORAGE_DRIVER=file.",
  );
}

/** Voor publieke pagina's: een opslagprobleem mag de site niet breken. */
export async function getPublishedProjectsSafe() {
  try {
    const storage = await getStorage();
    return await storage.listProjects({ publishedOnly: true });
  } catch (err) {
    console.error("[opslag] Projecten konden niet worden geladen:", err);
    return [];
  }
}

export * from "./types";
