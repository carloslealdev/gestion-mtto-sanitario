import { getAllDocuments, createDocument, getDocRef, runTransaction } from "@/lib/firestore"
import type { ReservationRequest, RequestItem } from "@/store/slices/requestsSlice"

const COLLECTION = "requests"

export interface RequestDocument extends ReservationRequest {
  id: string
}

export async function getAllRequests(): Promise<RequestDocument[]> {
  return getAllDocuments<ReservationRequest>(COLLECTION)
}

export async function createRequest(data: Omit<ReservationRequest, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateRequestStatus(id: string, status: ReservationRequest["status"]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Request not found")
    tx.set(ref, { id, ...snap.data(), status })
  })
}

export async function setApprovedItems(id: string, approvedItems: RequestItem[]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Request not found")
    tx.set(ref, { id, ...snap.data(), approvedItems })
  })
}

export async function approveRequest(id: string, items: RequestItem[], approvedItems: RequestItem[]): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Request not found")
    tx.set(ref, { id, ...snap.data(), status: "aprobada", items, approvedItems })
  })
}

export async function deleteRequest(id: string): Promise<void> {
  const { deleteDocument } = await import("@/lib/firestore")
  await deleteDocument(COLLECTION, id)
}
