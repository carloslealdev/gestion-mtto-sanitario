import { getAllDocuments, createDocument, getDocRef, runTransaction } from "@/lib/firestore"
import type { EPPReservation, EPPReservationStatus, EPPReservationItem } from "@/types/epp"

const COLLECTION = "eppReservations"

export async function getAllEPPReservations(): Promise<(EPPReservation & { id: string })[]> {
  return getAllDocuments<EPPReservation>(COLLECTION)
}

export async function createEPPReservation(data: Omit<EPPReservation, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateEPPReservationStatus(id: string, status: EPPReservationStatus): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("EPP reservation not found")
    tx.set(ref, { id, ...snap.data(), status })
  })
}

export async function setEPPReceivedItems(id: string, receivedItems: EPPReservationItem[]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("EPP reservation not found")
    tx.set(ref, { id, ...snap.data(), receivedItems })
  })
}
