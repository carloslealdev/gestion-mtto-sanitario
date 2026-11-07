import { getAllDocuments, createDocument, getDocRef, runTransaction } from "@/lib/firestore"
import type { EPPReservationRequest, EPPRequestItem } from "@/store/slices/eppRequestsSlice"

const COLLECTION = "eppRequests"

export async function getAllEPPRequests(): Promise<(EPPReservationRequest & { id: string })[]> {
  return getAllDocuments<EPPReservationRequest>(COLLECTION)
}

export async function createEPPRequest(data: Omit<EPPReservationRequest, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateEPPRequestStatus(id: string, status: EPPReservationRequest["status"]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("EPP request not found")
    tx.set(ref, { id, ...snap.data(), status })
  })
}

export async function setEPPApprovedItems(id: string, approvedItems: EPPRequestItem[]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("EPP request not found")
    tx.set(ref, { id, ...snap.data(), approvedItems })
  })
}

export async function approveEPPRequest(id: string, items: EPPRequestItem[], approvedItems: EPPRequestItem[]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("EPP request not found")
    tx.set(ref, { id, ...snap.data(), status: "aprobada", items, approvedItems })
  })
}
