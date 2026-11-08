export type AuthUserRole = "admin" | "encargado" | "general"

export interface AuthUser {
  username: string
  name: string
  role: AuthUserRole
  uid: string
}
