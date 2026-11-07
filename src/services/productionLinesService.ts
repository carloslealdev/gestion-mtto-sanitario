import { getAllDocuments, setDocument, deleteDocument, getDocRef, runTransaction } from "@/lib/firestore"
import type { ProductionLine } from "@/store/slices/productionLinesSlice"

const COLLECTION = "productionLines"

export async function getAllProductionLines(): Promise<(ProductionLine & { id: string })[]> {
  return getAllDocuments<ProductionLine>(COLLECTION)
}

export async function createProductionLine(id: string, data: ProductionLine): Promise<void> {
  await setDocument(COLLECTION, id, data)
}

export async function updateProductionLine(id: string, data: Partial<ProductionLine>): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, id)
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error("ProductionLine not found")
    tx.set(ref, { id, ...snap.data(), ...data })
  })
}

export async function deleteProductionLine(id: string): Promise<void> {
  await deleteDocument(COLLECTION, id)
}
