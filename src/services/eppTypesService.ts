import { getAllDocuments, getDocument, setDocument, deleteDocument, createDocument } from "@/lib/firestore"
import type { EPPType } from "@/store/slices/eppTypesSlice"

const COLLECTION = "eppTypes"

export async function getAllEPPTypes(): Promise<(EPPType & { id: string })[]> {
  return getAllDocuments<EPPType>(COLLECTION)
}

export async function createEPPType(data: Omit<EPPType, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateEPPType(id: string, data: Partial<EPPType>): Promise<void> {
  const existing = await getDocument<EPPType>(COLLECTION, id)
  if (!existing) throw new Error("EPPType not found")
  await setDocument(COLLECTION, id, { ...existing, ...data })
}

export async function deleteEPPType(id: string): Promise<void> {
  await deleteDocument(COLLECTION, id)
}
