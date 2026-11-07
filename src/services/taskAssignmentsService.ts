import { getDocument, getDocRef, runTransaction } from "@/lib/firestore"

export interface TaskAssignment {
  id: string
  maintenanceId: string
  machineId: string
  team: string
}

const COLLECTION = "taskAssignments"

export interface TaskAssignmentDocument {
  dateKey: string
  assignments: TaskAssignment[]
}

export async function getTaskAssignments(dateKey: string): Promise<TaskAssignment[]> {
  const doc = await getDocument<TaskAssignmentDocument>(COLLECTION, dateKey)
  return doc?.assignments || []
}

export async function addTaskAssignment(dateKey: string, assignment: TaskAssignment): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, dateKey)
    const snap = await tx.get(ref)
    const existing: TaskAssignment[] = snap.exists()
      ? ((snap.data() as TaskAssignmentDocument).assignments ?? [])
      : []
    tx.set(ref, { dateKey, assignments: [...existing, assignment] })
  })
}

export async function removeTaskAssignment(dateKey: string, assignmentId: string): Promise<void> {
  await runTransaction(async (tx) => {
    const ref = getDocRef(COLLECTION, dateKey)
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const assignments = ((snap.data() as TaskAssignmentDocument).assignments ?? []).filter(
      (a) => a.id !== assignmentId
    )
    tx.set(ref, { dateKey, assignments })
  })
}
