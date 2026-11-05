import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { NewQuoteRequest, Project, ProjectInput, QuoteRequest, RequestStatus, Storage } from "./types";

/**
 * Bestandsopslag voor lokale ontwikkeling, of voor een eigen server met een
 * blijvende schijf. Niet geschikt voor serverless hosting (Vercel e.d.).
 */
type Db = { requests: QuoteRequest[]; projects: Project[] };

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "studio-db.json");

let queue: Promise<unknown> = Promise.resolve();

/** Serialiseert schrijfacties binnen dit proces. */
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function read(): Promise<Db> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Db>;
    return { requests: parsed.requests ?? [], projects: parsed.projects ?? [] };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { requests: [], projects: [] };
    throw err;
  }
}

async function write(db: Db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

function sortProjects(list: Project[]) {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt));
}

export const fileStorage: Storage = {
  driver: "file",

  createRequest: (input: NewQuoteRequest) =>
    exclusive(async () => {
      const db = await read();
      const existing = db.requests.find((r) => r.submissionId === input.submissionId);
      if (existing) return { request: existing, duplicate: true };
      const request: QuoteRequest = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        status: "nieuw",
      };
      db.requests.push(request);
      await write(db);
      return { request, duplicate: false };
    }),

  async listRequests() {
    const db = await read();
    return [...db.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  updateRequestStatus: (id: string, status: RequestStatus) =>
    exclusive(async () => {
      const db = await read();
      const r = db.requests.find((x) => x.id === id);
      if (!r) return false;
      r.status = status;
      await write(db);
      return true;
    }),

  async listProjects(opts) {
    const db = await read();
    const list = opts?.publishedOnly ? db.projects.filter((p) => p.published) : db.projects;
    return sortProjects(list);
  },

  async getProject(id) {
    const db = await read();
    return db.projects.find((p) => p.id === id) ?? null;
  },

  createProject: (input: ProjectInput) =>
    exclusive(async () => {
      const db = await read();
      const now = new Date().toISOString();
      const project: Project = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
      db.projects.push(project);
      await write(db);
      return project;
    }),

  updateProject: (id: string, input: ProjectInput) =>
    exclusive(async () => {
      const db = await read();
      const idx = db.projects.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      const updated: Project = { ...db.projects[idx], ...input, updatedAt: new Date().toISOString() };
      db.projects[idx] = updated;
      await write(db);
      return updated;
    }),

  setProjectPublished: (id: string, published: boolean) =>
    exclusive(async () => {
      const db = await read();
      const p = db.projects.find((x) => x.id === id);
      if (!p) return false;
      p.published = published;
      p.updatedAt = new Date().toISOString();
      await write(db);
      return true;
    }),

  deleteProject: (id: string) =>
    exclusive(async () => {
      const db = await read();
      const before = db.projects.length;
      db.projects = db.projects.filter((p) => p.id !== id);
      if (db.projects.length === before) return false;
      await write(db);
      return true;
    }),
};
