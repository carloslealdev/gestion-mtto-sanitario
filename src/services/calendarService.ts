import { getAllDocuments, getDocument, setDocument } from "@/lib/firestore"
import type { MaintenanceEntry } from "@/store/slices/calendarSlice"

const COLLECTION = "calendar"

export interface CalendarDocument {
  dateKey: string
  maintenances: MaintenanceEntry[]
}

export async function getAllCalendarEntries(): Promise<(CalendarDocument & { id: string })[]> {
  return getAllDocuments<CalendarDocument>(COLLECTION)
}

export async function getCalendarEntry(dateKey: string): Promise<(CalendarDocument & { id: string }) | null> {
  return getDocument<CalendarDocument>(COLLECTION, dateKey)
}

export async function setCalendarEntry(dateKey: string, data: CalendarDocument): Promise<void> {
  await setDocument(COLLECTION, dateKey, data)
}

export async function addMaintenanceToDate(dateKey: string, maintenance: MaintenanceEntry): Promise<void> {
  const existing = await getCalendarEntry(dateKey)
  const entries = existing?.maintenances || []
  entries.push(maintenance)
  await setDocument(COLLECTION, dateKey, { dateKey, maintenances: entries })
}

export async function removeMaintenanceFromDate(dateKey: string, maintenanceId: number): Promise<void> {
  const existing = await getCalendarEntry(dateKey)
  if (!existing) return
  const entries = existing.maintenances.filter((m) => m.id !== maintenanceId)
  await setDocument(COLLECTION, dateKey, { dateKey, maintenances: entries })
}
