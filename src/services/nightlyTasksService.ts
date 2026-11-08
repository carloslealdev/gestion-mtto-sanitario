import { getAllDocuments, createDocument } from "@/lib/firestore"
import type { NightlyTaskReport } from "@/types/nightly"

const COLLECTION = "nightlyTasks"

export async function getAllNightlyTasks(): Promise<(NightlyTaskReport & { id: string })[]> {
  return getAllDocuments<NightlyTaskReport>(COLLECTION)
}

export async function createNightlyTaskReport(data: Omit<NightlyTaskReport, "id">): Promise<string> {
  return createDocument(COLLECTION, data)
}
