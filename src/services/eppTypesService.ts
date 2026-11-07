import { getAllDocuments, deleteDocument, createDocument, getDocRef, runTransaction } from "@/lib/firestore"
import type { EPPType } from "@/store/slices/eppTypesSlice"

const COLLECTION = "eppTypes"

export async function getAllEPPTypes(): Promise<(EPPType & { id: string })[]> {
  return getAllDocuments<EPPType>(COLLECTION)
}

export async function createEPPType(data: Omit<EPPType, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateEPPType(id: string, data: Partial<EPPType>): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("EPPType not found")
    tx.set(ref, { id, ...snap.data(), ...data })
  })
}

export async function deleteEPPType(id: string): Promise<void> {
  await deleteDocument(COLLECTION, id)
}
