// Firestore read boundary validation (Phase 7 / P3).
//
// Every document read through lib/firestore.ts is checked against a Zod schema
// keyed by collection. Semantics: LOG AND KEEP - a document that violates its
// schema is reported through the central logError funnel (console + buffer +
// optional Analytics exception) but still returned unchanged, so validation
// never makes data disappear from lists or reports. Missing schemas mean a
// collection is not yet covered and pass through silently.
//
// Schema output types are pinned to the domain types with defineSchema, so a
// schema that drifts from its TypeScript contract fails the build.

import { z } from "zod";
import type { CalendarDocument } from "@/services/calendarService";
import type { UserProfile } from "@/services/authService";
import type { GroupInventoryData } from "@/services/inventoryService";
import type { MaintenanceEntry } from "@/types/calendar";
import type {
  EPPReservation,
  EPPReservationRequest,
  EPPType,
} from "@/types/epp";
import type { NightlyTaskReport } from "@/types/nightly";
import type { Reservation, ReservationRequest } from "@/types/reservation";
import type { ProductionLine } from "@/types/production";
import type { Supply } from "@/types/supply";
import type { AddWorkerPayload } from "@/types/worker";
import { logError } from "./monitoring";

// Compile-time drift check: the schema output must be assignable to the
// declared domain type (missing or mistyped fields fail the build).
function defineSchema<T>(schema: z.ZodType<T>): z.ZodType<T> {
  return schema;
}

const workTeam = z.enum(["G1", "G2", "G3", "TN", "Sin asignar"]);
const reservationTeam = z.enum(["G1", "G2", "G3", "TN"]);
const reservationStatus = z.enum([
  "pendiente",
  "retirada_completa",
  "retirada_parcial",
  "cancelada",
]);
const requestStatus = z.enum(["pendiente", "aprobada", "rechazada"]);

const calendarSchema = defineSchema<CalendarDocument>(
  z.object({
    id: z.string(),
    dateKey: z.string(),
    maintenances: z.array(
      z.object({
        id: z.string(),
        lineId: z.number(),
        lineName: z.string(),
      }) satisfies z.ZodType<MaintenanceEntry>,
    ),
  }),
);

const usersSchema = defineSchema<UserProfile>(
  z.object({
    id: z.string(),
    uid: z.string(),
    cedula: z.string(),
    name: z.string(),
    role: z.enum(["admin", "encargado", "general"]),
    email: z.string(),
    username: z.string(),
    createdAt: z.string(),
  }),
);

const eppTypesSchema = defineSchema<EPPType>(
  z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    renewalTime: z.number(),
  }),
);

const eppDates = z.object({
  id: z.string().optional(),
  lastRenewal: z.string(),
  nextRenewal: z.string(),
  notOwned: z.boolean().optional(),
});

const workersSchema = defineSchema<AddWorkerPayload>(
  z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    cedula: z.string(),
    fechaIngreso: z.string(),
    workTeam,
    role: z.enum(["trabajador-encargado", "trabajador-general"]),
    epps: z.object({
      casco: eppDates,
      lentes: eppDates,
      botas: eppDates,
      auditivo: eppDates,
      fullFace: eppDates,
    }),
  }),
);

const suppliesSchema = defineSchema<Supply>(
  z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    unit: z.enum(["pieza", "par", "unidad", "litro"]),
    optimalLevel: z.number().optional(),
  }),
);

const productionLinesSchema = defineSchema<ProductionLine>(
  z.object({
    id: z.number(),
    name: z.string(),
    lineId: z.string(),
    machines: z.array(
      z.object({
        machineId: z.string(),
        name: z.string(),
        supplies_required: z.array(
          z.object({
            supplyId: z.string(),
            supplyName: z.string(),
            quantity: z.number(),
            unit: z.string(),
          }),
        ),
      }),
    ),
  }),
);

const inventorySchema = defineSchema<GroupInventoryData>(
  z.object({
    id: z.string(),
    groupId: z.string(),
    items: z.array(
      z.object({
        item: z.string(),
        quantity: z.number(),
      }),
    ),
  }),
);

const reservationItems = z.array(
  z.object({ item: z.string(), quantity: z.number() }),
);

const reservationsSchema = defineSchema<Reservation>(
  z.object({
    id: z.string(),
    team: reservationTeam,
    items: reservationItems,
    createdAt: z.string(),
    status: reservationStatus,
    receivedItems: reservationItems.optional(),
  }),
);

const requestsSchema = defineSchema<ReservationRequest>(
  z.object({
    id: z.string(),
    team: reservationTeam,
    items: reservationItems,
    createdAt: z.string(),
    status: requestStatus,
    approvedItems: reservationItems.optional(),
  }),
);

const eppReservationItems = z.array(
  z.object({
    epp: z.enum(["casco", "lentes", "botas", "auditivo", "fullFace"]),
    quantity: z.number(),
    talla: z.number().optional(),
  }),
);

const eppReservationsSchema = defineSchema<EPPReservation>(
  z.object({
    id: z.string(),
    workerCedula: z.string(),
    workerName: z.string(),
    items: eppReservationItems,
    createdAt: z.string(),
    status: reservationStatus,
    receivedItems: eppReservationItems.optional(),
  }),
);

const eppRequestItems = z.array(
  z.object({
    epp: z.string(),
    quantity: z.number(),
    talla: z.number().optional(),
  }),
);

const eppRequestsSchema = defineSchema<EPPReservationRequest>(
  z.object({
    id: z.string(),
    workerCedula: z.string(),
    workerName: z.string(),
    items: eppRequestItems,
    createdAt: z.string(),
    status: requestStatus,
    approvedItems: eppRequestItems.optional(),
  }),
);

const nightlyTasksSchema = defineSchema<NightlyTaskReport>(
  z.object({
    id: z.string(),
    reportType: z.enum(["mantenimiento_sanitario", "otras_tareas"]),
    team: reservationTeam,
    responsibleName: z.string(),
    responsibleCedula: z.string(),
    createdAt: z.string(),
    equipment: z.array(
      z.object({
        lineId: z.number(),
        lineName: z.string(),
        machineId: z.string(),
        machineName: z.string(),
      }),
    ),
  }),
);

/** Zod schemas keyed by Firestore collection, for every collection read via lib/firestore.ts. */
export const documentSchemas: Record<string, z.ZodType> = {
  calendar: calendarSchema,
  users: usersSchema,
  eppTypes: eppTypesSchema,
  workers: workersSchema,
  supplies: suppliesSchema,
  productionLines: productionLinesSchema,
  inventory: inventorySchema,
  reservations: reservationsSchema,
  requests: requestsSchema,
  eppReservations: eppReservationsSchema,
  eppRequests: eppRequestsSchema,
  nightlyTasks: nightlyTasksSchema,
};

export function hasSchema(collection: string): boolean {
  return collection in documentSchemas;
}

/**
 * Validates a document against its collection schema. Returns the original
 * document in every case (log-and-keep); only the violation is reported.
 */
export function validateDocument<T>(
  collection: string,
  document: T,
): T {
  const schema = documentSchemas[collection];
  if (!schema) return document;

  const result = schema.safeParse(document);
  if (result.success) return document;

  const issues = result.error.issues
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join(" | ");

  logError(new Error(`Invalid Firestore document in "${collection}"`), {
    source: "firestore-read",
    collection,
    documentId: String(
      (document as { id?: unknown } | null)?.id ?? "<unknown>",
    ),
    issues,
  });

  return document;
}
