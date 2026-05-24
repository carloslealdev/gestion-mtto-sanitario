import { getAllDocuments, getDocument, setDocument, updateDocument, deleteDocument } from "@/lib/firestore"
import type { AddWorkerPayload } from "@/store/slices/workersSlice"

const COLLECTION = "workers"

export interface WorkerDocument extends AddWorkerPayload {
  id: string
  uid?: string
}

export async function getAllWorkers(): Promise<WorkerDocument[]> {
  return getAllDocuments<AddWorkerPayload>(COLLECTION)
}

export async function getWorker(cedula: string): Promise<WorkerDocument | null> {
  return getDocument<AddWorkerPayload>(COLLECTION, cedula)
}

export async function createWorker(worker: AddWorkerPayload & { uid?: string }): Promise<void> {
  await setDocument(COLLECTION, worker.cedula, worker)
}

export async function updateWorker(cedula: string, data: Partial<AddWorkerPayload>): Promise<void> {
  const existing = await getWorker(cedula)
  if (!existing) throw new Error("Worker not found")
  await setDocument(COLLECTION, cedula, { ...existing, ...data })
}

export async function patchWorker(cedula: string, data: Partial<AddWorkerPayload>): Promise<void> {
  await updateDocument(COLLECTION, cedula, data)
}

export async function deleteWorker(cedula: string): Promise<void> {
  await deleteDocument(COLLECTION, cedula)
}
