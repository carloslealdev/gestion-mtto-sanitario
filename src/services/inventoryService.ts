import { getAllDocuments, getDocument, setDocument, deleteDocument } from "@/lib/firestore"

const COLLECTION = "inventory"

export interface InventoryItem {
  item: string
  quantity: number
}

export interface GroupInventoryData {
  groupId: string
  items: InventoryItem[]
}

export async function getAllInventories(): Promise<(GroupInventoryData & { id: string })[]> {
  return getAllDocuments<GroupInventoryData>(COLLECTION)
}

export async function getInventory(groupId: string): Promise<(GroupInventoryData & { id: string }) | null> {
  return getDocument<GroupInventoryData>(COLLECTION, groupId)
}

export async function setInventory(groupId: string, data: GroupInventoryData): Promise<void> {
  await setDocument(COLLECTION, groupId, data)
}

export async function deleteInventory(groupId: string): Promise<void> {
  await deleteDocument(COLLECTION, groupId)
}

export async function updateInventoryItem(
  groupId: string,
  itemKey: string,
  quantity: number
): Promise<void> {
  const existing = await getInventory(groupId)
  if (!existing) throw new Error("Inventory not found")
  const items = existing.items.map((i) =>
    i.item === itemKey ? { ...i, quantity: Math.max(0, i.quantity + quantity) } : i
  )
  if (!items.find((i) => i.item === itemKey)) {
    items.push({ item: itemKey, quantity: Math.max(0, quantity) })
  }
  await setDocument(COLLECTION, groupId, { groupId, items })
}
