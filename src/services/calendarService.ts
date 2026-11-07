import { getAllDocuments, getDocument, setDocument, getDocRef, runTransaction } from "@/lib/firestore"
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
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, dateKey)
    const snap = await tx.get(ref)
    const entries = snap.exists()
      ? [...((snap.data() as CalendarDocument).maintenances || [])]
      : []
    entries.push(maintenance)
    tx.set(ref, { dateKey, maintenances: entries })
  })
}

export async function removeMaintenanceFromDate(dateKey: string, maintenanceId: string): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, dateKey)
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    // String() on both sides: legacy documents store numeric ids while the
    // app now generates string ids (see calendarSlice fetch normalization).
    const entries = ((snap.data() as CalendarDocument).maintenances || []).filter(
      (m) => String(m.id) !== String(maintenanceId)
    )
    tx.set(ref, { dateKey, maintenances: entries })
  })
}
