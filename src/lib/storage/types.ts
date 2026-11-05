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
};

export type NewQuoteRequest = Omit<QuoteRequest, "id" | "createdAt" | "status">;

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
  updateRequestStatus(id: string, status: RequestStatus): Promise<boolean>;

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
