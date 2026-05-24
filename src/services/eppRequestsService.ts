import { getAllDocuments, setDocument, createDocument } from "@/lib/firestore"
import type { EPPReservationRequest, EPPRequestItem } from "@/store/slices/eppRequestsSlice"

const COLLECTION = "eppRequests"

export async function getAllEPPRequests(): Promise<(EPPReservationRequest & { id: string })[]> {
  return getAllDocuments<EPPReservationRequest>(COLLECTION)
}

export async function createEPPRequest(data: Omit<EPPReservationRequest, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateEPPRequestStatus(id: string, status: EPPReservationRequest["status"]): Promise<void> {
  await setDocument(COLLECTION, id, { status })
}

export async function setEPPApprovedItems(id: string, approvedItems: EPPRequestItem[]): Promise<void> {
  await setDocument(COLLECTION, id, { approvedItems })
}
