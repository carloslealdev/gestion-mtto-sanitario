import { getAllDocuments, createDocument, getDocRef, runTransaction } from "@/lib/firestore"
import type { Reservation, ReservationStatus, ReservationItem } from "@/types/reservation"

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
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Reservation not found")
    tx.set(ref, { id, ...snap.data(), status })
  })
}

export async function setReceivedItems(id: string, receivedItems: ReservationItem[]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Reservation not found")
    tx.set(ref, { id, ...snap.data(), receivedItems })
  })
}
