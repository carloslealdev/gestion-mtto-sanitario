import { getAllDocuments, getDocument, setDocument, createDocument } from "@/lib/firestore"
import type { EPPReservationRequest, EPPRequestItem } from "@/store/slices/eppRequestsSlice"

const COLLECTION = "eppRequests"

export async function getAllEPPRequests(): Promise<(EPPReservationRequest & { id: string })[]> {
  return getAllDocuments<EPPReservationRequest>(COLLECTION)
}

export async function createEPPRequest(data: Omit<EPPReservationRequest, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateEPPRequestStatus(id: string, status: EPPReservationRequest["status"]): Promise<void> {
  const existing = await getDocument<EPPReservationRequest>(COLLECTION, id)
  if (!existing) throw new Error("EPP request not found")
  await setDocument(COLLECTION, id, { ...existing, status })
}

export async function setEPPApprovedItems(id: string, approvedItems: EPPRequestItem[]): Promise<void> {
  const existing = await getDocument<EPPReservationRequest>(COLLECTION, id)
  if (!existing) throw new Error("EPP request not found")
  await setDocument(COLLECTION, id, { ...existing, approvedItems })
}

export async function approveEPPRequest(id: string, items: EPPRequestItem[], approvedItems: EPPRequestItem[]): Promise<void> {
  const existing = await getDocument<EPPReservationRequest>(COLLECTION, id)
  if (!existing) throw new Error("EPP request not found")
  await setDocument(COLLECTION, id, { ...existing, status: "aprobada", items, approvedItems })
}
