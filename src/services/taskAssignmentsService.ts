import { getDocument, setDocument } from "@/lib/firestore"

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
  const existing = await getTaskAssignments(dateKey)
  const assignments = [...existing, assignment]
  await setDocument(COLLECTION, dateKey, { dateKey, assignments })
}

export async function removeTaskAssignment(dateKey: string, assignmentId: string): Promise<void> {
  const existing = await getTaskAssignments(dateKey)
  const assignments = existing.filter((a) => a.id !== assignmentId)
  await setDocument(COLLECTION, dateKey, { dateKey, assignments })
}
