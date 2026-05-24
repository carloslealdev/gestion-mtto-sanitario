import { getAllDocuments, getDocument, setDocument, deleteDocument, createDocument } from "@/lib/firestore"
import type { Supply } from "@/store/slices/suppliesSlice"

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
  const existing = await getDocument<Supply>(COLLECTION, id)
  if (!existing) throw new Error("Supply not found")
  await setDocument(COLLECTION, id, { ...existing, ...data })
}

export async function deleteSupply(id: string): Promise<void> {
  await deleteDocument(COLLECTION, id)
}
