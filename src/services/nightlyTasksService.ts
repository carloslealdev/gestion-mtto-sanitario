import { getAllDocuments, createDocument } from "@/lib/firestore"
import type { NightlyTaskReport } from "@/store/slices/nightlyTasksSlice"

const COLLECTION = "nightlyTasks"

export async function getAllNightlyTasks(): Promise<(NightlyTaskReport & { id: string })[]> {
  return getAllDocuments<NightlyTaskReport>(COLLECTION)
}

export async function createNightlyTaskReport(data: Omit<NightlyTaskReport, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function clearAllNightlyTasks(): Promise<void> {
  const { getAllDocuments, deleteDocument } = await import("@/lib/firestore")
  const all = await getAllDocuments(COLLECTION)
  for (const doc of all) {
    await deleteDocument(COLLECTION, doc.id)
  }
}
