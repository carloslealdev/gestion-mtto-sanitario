import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth, FIREBASE_API_KEY } from "@/lib/firebase"
import { getDocument, setDocument, getAllDocuments, updateDocument, deleteDocument } from "@/lib/firestore"
import { hashPassword } from "@/lib/crypto"
import type { AuthUserRole } from "@/store/slices/authSlice"

const CEDULA_DOMAIN = "@gestion-mtto.app"

function cedulaToEmail(cedula: string): string {
  const clean = cedula.replace("V-", "").trim()
  return `${clean}${CEDULA_DOMAIN}`
}

export interface UserProfile {
  uid: string
  cedula: string
  name: string
  role: AuthUserRole
  email: string
  username: string
  password?: string
  createdAt: string
}

const BOOTSTRAP_USERS: { cedula: string; password: string; name: string; role: AuthUserRole }[] = [
  { cedula: "admin", password: "123456", name: "Administrador", role: "admin" },
]

async function tryBootstrapUser(
  cedula: string,
  password: string
): Promise<{ user: User; profile: UserProfile; idToken: string } | null> {
  const bootstrapUser = BOOTSTRAP_USERS.find((u) => u.cedula === cedula && u.password === password)
  if (!bootstrapUser) return null

  try {
    const email = cedulaToEmail(bootstrapUser.cedula)
    const userCredential = await createUserWithEmailAndPassword(auth, email, bootstrapUser.password)

    const profile: UserProfile = {
      uid: userCredential.user.uid,
      cedula: bootstrapUser.cedula,
      name: bootstrapUser.name,
      role: bootstrapUser.role,
      email,
      username: bootstrapUser.cedula,
      password: hashPassword(bootstrapUser.password),
      createdAt: new Date().toISOString(),
    }

    await setDocument("users", userCredential.user.uid, profile)
    const idToken = await userCredential.user.getIdToken()

    return { user: userCredential.user, profile, idToken }
  } catch {
    return null
  }
}

export async function loginWithCedula(
  cedula: string,
  password: string
): Promise<{ user: User; profile: UserProfile; idToken: string }> {
  const email = cedulaToEmail(cedula)

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const idToken = await userCredential.user.getIdToken()

    const profile = await getDocument<UserProfile>("users", userCredential.user.uid)
    if (!profile) {
      throw new Error("Perfil de usuario no encontrado")
    }

    return { user: userCredential.user, profile, idToken }
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (
      err?.code === "auth/user-not-found" ||
      err?.code === "auth/invalid-credential"
    ) {
      const bootstrapped = await tryBootstrapUser(cedula, password)
      if (bootstrapped) return bootstrapped
    }
    throw error
  }
}

export async function createUserWithoutSignIn(
  cedula: string,
  password: string,
  name: string,
  role: AuthUserRole
): Promise<{ uid: string; email: string }> {
  const email = cedulaToEmail(cedula)
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  )
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error?.message || "Error al crear usuario en Firebase Auth")
  }

  const uid: string = data.localId
  const cleanCedula = cedula.replace("V-", "").trim()

  const profile: UserProfile = {
    uid,
    cedula: cleanCedula,
    name,
    role,
    email,
    username: cleanCedula,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  }

  await setDocument("users", uid, profile)

  return { uid, email }
}

export async function registerUser(
  cedula: string,
  password: string,
  name: string,
  role: AuthUserRole
): Promise<{ uid: string; email: string }> {
  const email = cedulaToEmail(cedula)
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const cleanCedula = cedula.replace("V-", "").trim()

  const profile: UserProfile = {
    uid: userCredential.user.uid,
    cedula: cleanCedula,
    name,
    role,
    email,
    username: cleanCedula,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  }

  await setDocument("users", userCredential.user.uid, profile)

  return { uid: userCredential.user.uid, email }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  return getAllDocuments<UserProfile>("users")
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  return getDocument<UserProfile>("users", uid)
}

export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfile, "uid">>): Promise<void> {
  await updateDocument("users", uid, data)
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDocument("users", uid)
}
