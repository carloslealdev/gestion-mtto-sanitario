import { getAllDocuments, deleteDocument, createDocument, getDocRef, runTransaction } from "@/lib/firestore"
import type { Supply } from "@/types/supply"

const COLLECTION = "supplies"

export interface SupplyDocument extends Supply {
  id: string
}

export async function getAllSupplies(): Promise<SupplyDocument[]> {
  return getAllDocuments<Supply>(COLLECTION)
}

export async function createSupply(supply: Omit<Supply, "id">): Promise<string> {
  return createDocument(COLLECTION, supply)
}

export async function updateSupply(id: string, data: Partial<Supply>): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("Supply not found")
    tx.set(ref, { id, ...snap.data(), ...data })
  })
}

export async function deleteSupply(id: string): Promise<void> {
  await deleteDocument(COLLECTION, id)
}
