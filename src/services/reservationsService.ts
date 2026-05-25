import { getAllDocuments, getDocument, setDocument, createDocument } from "@/lib/firestore"
import type { Reservation, ReservationStatus, ReservationItem } from "@/store/slices/reservationsSlice"

const COLLECTION = "reservations"

export interface ReservationDocument extends Reservation {
  id: string
}

export async function getAllReservations(): Promise<ReservationDocument[]> {
  return getAllDocuments<Reservation>(COLLECTION)
}

export async function createReservation(data: Omit<Reservation, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  const existing = await getDocument<Reservation>(COLLECTION, id)
  if (!existing) throw new Error("Reservation not found")
  await setDocument(COLLECTION, id, { ...existing, status })
}

export async function setReceivedItems(id: string, receivedItems: ReservationItem[]): Promise<void> {
  const existing = await getDocument<Reservation>(COLLECTION, id)
  if (!existing) throw new Error("Reservation not found")
  await setDocument(COLLECTION, id, { ...existing, receivedItems })
}
