import "server-only";
import postgres from "postgres";
import type {
  Appointment,
  AppointmentInput,
  NewQuoteRequest,
  Project,
  ProjectInput,
  QuoteRequest,
  RequestEvent,
  RequestStatus,
  Storage,
} from "./types";

/**
 * Postgres-opslag voor productie (bijv. Neon, Supabase, Vercel Postgres).
 * Tabellen worden bij het eerste gebruik aangemaakt.
 */

let sqlClient: postgres.Sql | null = null;
let ready: Promise<void> | null = null;

function sql() {
  if (!sqlClient) {
    sqlClient = postgres(process.env.DATABASE_URL as string, {
      max: 3,
      idle_timeout: 20,
      prepare: false, // werkt ook achter connection poolers
    });
  }
  return sqlClient;
}

function ensureSchema() {
  if (!ready) {
    const db = sql();
    ready = (async () => {
      await db`
        create table if not exists quote_requests (
          id uuid primary key default gen_random_uuid(),
          submission_id text not null unique,
          created_at timestamptz not null default now(),
          services text[] not null,
          finish text,
          vehicle text not null,
          name text not null,
          email text,
          phone text,
          message text,
          preferred_date date,
          status text not null default 'nieuw'
        )`;
      await db`
        create table if not exists projects (
          id uuid primary key default gen_random_uuid(),
          title text not null,
          service text,
          vehicle text,
          description text,
          type text not null,
          aspect text not null,
          image_src text,
          image_alt text not null default '',
          video_src text,
          before_src text,
          after_src text,
          published boolean not null default false,
          sort_order integer not null default 0,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )`;
      // Aanvullingen (additief, bestaande gegevens blijven staan).
      await db`alter table quote_requests add column if not exists price_cents integer`;
      await db`
        create table if not exists request_events (
          id uuid primary key default gen_random_uuid(),
          request_id uuid not null references quote_requests(id) on delete cascade,
          created_at timestamptz not null default now(),
          kind text not null,
          body text not null default ''
        )`;
      await db`create index if not exists request_events_request_idx on request_events (request_id, created_at)`;
      await db`
        create table if not exists appointments (
          id uuid primary key default gen_random_uuid(),
          kind text not null,
          title text not null,
          request_id uuid references quote_requests(id) on delete set null,
          start_date date not null,
          end_date date not null,
          start_time text,
          end_time text,
          notes text,
          created_at timestamptz not null default now()
        )`;
      await db`create index if not exists appointments_dates_idx on appointments (start_date, end_date)`;
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRequest(r: any): QuoteRequest {
  return {
    id: r.id,
    submissionId: r.submission_id,
    createdAt: new Date(r.created_at).toISOString(),
    services: r.services,
    finish: r.finish,
    vehicle: r.vehicle,
    name: r.name,
    email: r.email,
    phone: r.phone,
    message: r.message,
    preferredDate: r.preferred_date ? new Date(r.preferred_date).toISOString().slice(0, 10) : null,
    status: r.status,
    priceCents: r.price_cents ?? null,
  };
}

/** Datums komen als tekst (::text) binnen, zodat tijdzones nooit een dag verschuiven. */
function toAppointment(r: any): Appointment {
  return {
    id: r.id,
    kind: r.kind,
    title: r.title,
    requestId: r.request_id,
    startDate: r.sd,
    endDate: r.ed,
    startTime: r.start_time,
    endTime: r.end_time,
    notes: r.notes,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

function appointmentColumns(a: AppointmentInput) {
  return {
    kind: a.kind,
    title: a.title,
    request_id: a.requestId,
    start_date: a.startDate,
    end_date: a.endDate,
    start_time: a.startTime,
    end_time: a.endTime,
    notes: a.notes,
  };
}

function toEvent(r: any): RequestEvent {
  return {
    id: r.id,
    requestId: r.request_id,
    createdAt: new Date(r.created_at).toISOString(),
    kind: r.kind,
    body: r.body,
  };
}

function toProject(r: any): Project {
  return {
    id: r.id,
    title: r.title,
    service: r.service,
    vehicle: r.vehicle,
    description: r.description,
    type: r.type,
    aspect: r.aspect,
    imageSrc: r.image_src,
    imageAlt: r.image_alt,
    videoSrc: r.video_src,
    beforeSrc: r.before_src,
    afterSrc: r.after_src,
    published: r.published,
    sortOrder: r.sort_order,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function projectColumns(p: ProjectInput) {
  return {
    title: p.title,
    service: p.service,
    vehicle: p.vehicle,
    description: p.description,
    type: p.type,
    aspect: p.aspect,
    image_src: p.imageSrc,
    image_alt: p.imageAlt,
    video_src: p.videoSrc,
    before_src: p.beforeSrc,
    after_src: p.afterSrc,
    published: p.published,
    sort_order: p.sortOrder,
  };
}

export const postgresStorage: Storage = {
  driver: "postgres",

  async createRequest(input: NewQuoteRequest) {
    await ensureSchema();
    const db = sql();
    const inserted = await db`
      insert into quote_requests
        (submission_id, services, finish, vehicle, name, email, phone, message, preferred_date)
      values
        (${input.submissionId}, ${input.services}, ${input.finish}, ${input.vehicle}, ${input.name},
         ${input.email}, ${input.phone}, ${input.message}, ${input.preferredDate})
      on conflict (submission_id) do nothing
      returning *`;
    if (inserted.length > 0) return { request: toRequest(inserted[0]), duplicate: false };
    const existing = await db`select * from quote_requests where submission_id = ${input.submissionId}`;
    return { request: toRequest(existing[0]), duplicate: true };
  },

  async listRequests() {
    await ensureSchema();
    const rows = await sql()`select * from quote_requests order by created_at desc limit 500`;
    return rows.map(toRequest);
  },

  async getRequest(id) {
    await ensureSchema();
    const rows = await sql()`select * from quote_requests where id = ${id}`;
    return rows[0] ? toRequest(rows[0]) : null;
  },

  async updateRequestStatus(id: string, status: RequestStatus) {
    await ensureSchema();
    return sql().begin(async (tx) => {
      const prev = await tx`select status from quote_requests where id = ${id} for update`;
      if (prev.length === 0) return false;
      if (prev[0].status === status) return true;
      await tx`update quote_requests set status = ${status} where id = ${id}`;
      await tx`insert into request_events (request_id, kind, body) values (${id}, 'status', ${status})`;
      return true;
    });
  },

  async setRequestPrice(id, priceCents) {
    await ensureSchema();
    return sql().begin(async (tx) => {
      const prev = await tx`select price_cents from quote_requests where id = ${id} for update`;
      if (prev.length === 0) return false;
      if ((prev[0].price_cents ?? null) === priceCents) return true;
      await tx`update quote_requests set price_cents = ${priceCents} where id = ${id}`;
      await tx`insert into request_events (request_id, kind, body) values (${id}, 'price', ${priceCents === null ? "" : String(priceCents)})`;
      return true;
    });
  },

  async addRequestEvent(id, kind, body) {
    await ensureSchema();
    const rows = await sql()`
      insert into request_events (request_id, kind, body)
      select id, ${kind}, ${body} from quote_requests where id = ${id}
      returning id`;
    return rows.length > 0;
  },

  async listAppointments(opts) {
    await ensureSchema();
    const db = sql();
    const rows = opts?.requestId
      ? await db`select *, start_date::text as sd, end_date::text as ed from appointments
                 where request_id = ${opts.requestId} order by start_date, start_time nulls first`
      : await db`select *, start_date::text as sd, end_date::text as ed from appointments
                 where (${opts?.to ?? null}::date is null or start_date <= ${opts?.to ?? null}::date)
                   and (${opts?.from ?? null}::date is null or end_date >= ${opts?.from ?? null}::date)
                 order by start_date, start_time nulls first`;
    return rows.map(toAppointment);
  },

  async getAppointment(id) {
    await ensureSchema();
    const rows = await sql()`select *, start_date::text as sd, end_date::text as ed from appointments where id = ${id}`;
    return rows[0] ? toAppointment(rows[0]) : null;
  },

  async createAppointment(input) {
    await ensureSchema();
    const db = sql();
    const rows = await db`insert into appointments ${db(appointmentColumns(input))}
                          returning *, start_date::text as sd, end_date::text as ed`;
    return toAppointment(rows[0]);
  },

  async updateAppointment(id, input) {
    await ensureSchema();
    const db = sql();
    const rows = await db`update appointments set ${db(appointmentColumns(input))} where id = ${id}
                          returning *, start_date::text as sd, end_date::text as ed`;
    return rows[0] ? toAppointment(rows[0]) : null;
  },

  async deleteAppointment(id) {
    await ensureSchema();
    const rows = await sql()`delete from appointments where id = ${id} returning id`;
    return rows.length > 0;
  },

  async listRequestEvents(id) {
    await ensureSchema();
    const rows = await sql()`select * from request_events where request_id = ${id} order by created_at asc`;
    return rows.map(toEvent);
  },

  async deleteRequest(id) {
    await ensureSchema();
    const rows = await sql()`delete from quote_requests where id = ${id} returning id`;
    return rows.length > 0;
  },

  async listProjects(opts) {
    await ensureSchema();
    const db = sql();
    const rows = opts?.publishedOnly
      ? await db`select * from projects where published = true order by sort_order asc, created_at desc`
      : await db`select * from projects order by sort_order asc, created_at desc`;
    return rows.map(toProject);
  },

  async getProject(id) {
    await ensureSchema();
    const rows = await sql()`select * from projects where id = ${id}`;
    return rows[0] ? toProject(rows[0]) : null;
  },

  async createProject(input) {
    await ensureSchema();
    const db = sql();
    const rows = await db`insert into projects ${db(projectColumns(input))} returning *`;
    return toProject(rows[0]);
  },

  async updateProject(id, input) {
    await ensureSchema();
    const db = sql();
    const rows = await db`
      update projects set ${db(projectColumns(input))}, updated_at = now()
      where id = ${id} returning *`;
    return rows[0] ? toProject(rows[0]) : null;
  },

  async setProjectPublished(id, published) {
    await ensureSchema();
    const rows = await sql()`
      update projects set published = ${published}, updated_at = now() where id = ${id} returning id`;
    return rows.length > 0;
  },

  async deleteProject(id) {
    await ensureSchema();
    const rows = await sql()`delete from projects where id = ${id} returning id`;
    return rows.length > 0;
  },
};
