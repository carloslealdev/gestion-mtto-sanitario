import { getDocument, setDocument } from "@/lib/firestore"

const COLLECTION = "nightlyTasksUi"

export interface NightlyScopeItem {
  lineId: number
  lineName: string
  machineId: string
  machineName: string
  team: string
}

interface NightlyScopeDoc {
  dateKey: string
  items: NightlyScopeItem[]
}

export async function setNightlyScope(dateKey: string, items: NightlyScopeItem[]): Promise<void> {
  await setDocument(COLLECTION, dateKey, { dateKey, items })
}

export async function getNightlyScope(dateKey: string): Promise<NightlyScopeItem[]> {
  const doc = await getDocument<NightlyScopeDoc>(COLLECTION, dateKey)
  return doc?.items || []
}
