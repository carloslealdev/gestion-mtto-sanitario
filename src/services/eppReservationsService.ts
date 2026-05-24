import { getAllDocuments, setDocument, createDocument } from "@/lib/firestore"
import type { EPPReservation, EPPReservationStatus, EPPReservationItem } from "@/store/slices/eppReservationsSlice"

const COLLECTION = "eppReservations"

export async function getAllEPPReservations(): Promise<(EPPReservation & { id: string })[]> {
  return getAllDocuments<EPPReservation>(COLLECTION)
}

export async function createEPPReservation(data: Omit<EPPReservation, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateEPPReservationStatus(id: string, status: EPPReservationStatus): Promise<void> {
  await setDocument(COLLECTION, id, { status })
}

export async function setEPPReceivedItems(id: string, receivedItems: EPPReservationItem[]): Promise<void> {
  await setDocument(COLLECTION, id, { receivedItems })
}
