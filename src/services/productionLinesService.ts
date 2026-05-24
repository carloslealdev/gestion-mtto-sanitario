import { getAllDocuments, getDocument, setDocument, deleteDocument } from "@/lib/firestore"
import type { ProductionLine } from "@/store/slices/productionLinesSlice"

const COLLECTION = "productionLines"

export async function getAllProductionLines(): Promise<(ProductionLine & { id: string })[]> {
  return getAllDocuments<ProductionLine>(COLLECTION)
}

export async function createProductionLine(id: string, data: ProductionLine): Promise<void> {
  await setDocument(COLLECTION, id, data)
}

export async function updateProductionLine(id: string, data: Partial<ProductionLine>): Promise<void> {
  const existing = await getDocument<ProductionLine>(COLLECTION, id)
  if (!existing) throw new Error("ProductionLine not found")
  await setDocument(COLLECTION, id, { ...existing, ...data })
}

export async function deleteProductionLine(id: string): Promise<void> {
  await deleteDocument(COLLECTION, id)
}
