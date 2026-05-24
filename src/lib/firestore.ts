import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  type DocumentData,
  type OrderByDirection,
} from "firebase/firestore"
import { db } from "./firebase"

export function getCollectionRef(collectionName: string) {
  return collection(db, collectionName)
}

export function getDocRef(collectionName: string, docId: string) {
  return doc(db, collectionName, docId)
}

export async function getAllDocuments<T>(collectionName: string, sortField?: string, sortDir?: OrderByDirection): Promise<(T & { id: string })[]> {
  const q = sortField
    ? query(getCollectionRef(collectionName), orderBy(sortField, sortDir || "asc"))
    : query(getCollectionRef(collectionName))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }))
}

export async function getDocument<T>(collectionName: string, docId: string): Promise<(T & { id: string }) | null> {
  const docSnap = await getDoc(getDocRef(collectionName, docId))
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as T & { id: string }
}

export async function setDocument(collectionName: string, docId: string, data: DocumentData) {
  await setDoc(doc(db, collectionName, docId), data)
}

export async function updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, collectionName, docId), data)
}

export async function deleteDocument(collectionName: string, docId: string) {
  await deleteDoc(doc(db, collectionName, docId))
}

export async function createDocument(collectionName: string, data: DocumentData): Promise<string> {
  const docRef = doc(collection(db, collectionName))
  await setDoc(docRef, data)
  return docRef.id
}
