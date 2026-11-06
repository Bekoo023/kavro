import type { FinishSlug, ServiceSlug } from "@/config/services";

export const REQUEST_STATUSES = ["nieuw", "in-behandeling", "ingepland", "afgerond", "geannuleerd"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const statusLabels: Record<RequestStatus, string> = {
  nieuw: "Nieuw",
  "in-behandeling": "In behandeling",
  ingepland: "Ingepland",
  afgerond: "Afgerond",
  geannuleerd: "Geannuleerd",
};

export type QuoteRequest = {
  id: string;
  submissionId: string;
  createdAt: string; // ISO
  services: ServiceSlug[];
  finish: FinishSlug | null;
  vehicle: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  preferredDate: string | null; // YYYY-MM-DD
  status: RequestStatus;
  /** Offerteprijs in centen (intern, nooit publiek). */
  priceCents: number | null;
};

export type NewQuoteRequest = Omit<QuoteRequest, "id" | "createdAt" | "status" | "priceCents">;

/** Tijdlijn van een aanvraag: notities en automatisch gelogde wijzigingen. */
export const EVENT_KINDS = ["note", "status", "price", "planned"] as const;
export type RequestEventKind = (typeof EVENT_KINDS)[number];

export type RequestEvent = {
  id: string;
  requestId: string;
  createdAt: string; // ISO
  kind: RequestEventKind;
  /** note: de tekst. status: de nieuwe status. price: centen of "" (gewist). planned: "YYYY-MM-DD" (startdatum). */
  body: string;
};

/** Agenda: werk aan een auto, een losse afspraak, of een blokkade (vrij, dicht). */
export const APPOINTMENT_KINDS = ["werk", "afspraak", "blokkade"] as const;
export type AppointmentKind = (typeof APPOINTMENT_KINDS)[number];

export const appointmentKindLabels: Record<AppointmentKind, string> = {
  werk: "Werk aan auto",
  afspraak: "Afspraak",
  blokkade: "Blokkade / vrij",
};

export type Appointment = {
  id: string;
  kind: AppointmentKind;
  title: string;
  requestId: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD, inclusief (gelijk aan startDate bij één dag)
  startTime: string | null; // HH:MM; null = hele dag
  endTime: string | null; // HH:MM
  notes: string | null;
  createdAt: string;
};

export type AppointmentInput = Omit<Appointment, "id" | "createdAt">;

export const PROJECT_TYPES = ["foto", "video", "voor-na"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const ASPECTS = ["16/9", "3/2", "4/3", "1/1", "4/5"] as const;
export type Aspect = (typeof ASPECTS)[number];

export type Project = {
  id: string;
  title: string;
  service: ServiceSlug | null;
  vehicle: string | null;
  description: string | null;
  type: ProjectType;
  aspect: Aspect;
  /** foto: hoofdbeeld. video: poster. voor-na: niet gebruikt. */
  imageSrc: string | null;
  imageAlt: string;
  videoSrc: string | null;
  beforeSrc: string | null;
  afterSrc: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export interface Storage {
  readonly driver: "file" | "postgres";
  createRequest(input: NewQuoteRequest): Promise<{ request: QuoteRequest; duplicate: boolean }>;
  listRequests(): Promise<QuoteRequest[]>;
  getRequest(id: string): Promise<QuoteRequest | null>;
  /** Wijzigt de status en logt dit in de tijdlijn (alleen als hij echt verandert). */
  updateRequestStatus(id: string, status: RequestStatus): Promise<boolean>;
  /** Zet of wist de offerteprijs en logt dit in de tijdlijn. */
  setRequestPrice(id: string, priceCents: number | null): Promise<boolean>;
  /** Voegt een tijdlijnregel toe (notitie of ingepland). */
  addRequestEvent(id: string, kind: "note" | "planned", body: string): Promise<boolean>;
  listRequestEvents(id: string): Promise<RequestEvent[]>;
  /** Verwijdert de aanvraag inclusief tijdlijn. */
  deleteRequest(id: string): Promise<boolean>;

  /** Afspraken die (deels) in [from, to] vallen, of alle afspraken van één aanvraag. */
  listAppointments(opts?: { from?: string; to?: string; requestId?: string }): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | null>;
  createAppointment(input: AppointmentInput): Promise<Appointment>;
  updateAppointment(id: string, input: AppointmentInput): Promise<Appointment | null>;
  deleteAppointment(id: string): Promise<boolean>;

  listProjects(opts?: { publishedOnly?: boolean }): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(input: ProjectInput): Promise<Project>;
  updateProject(id: string, input: ProjectInput): Promise<Project | null>;
  setProjectPublished(id: string, published: boolean): Promise<boolean>;
  deleteProject(id: string): Promise<boolean>;
}

export class StorageNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageNotConfiguredError";
  }
}
