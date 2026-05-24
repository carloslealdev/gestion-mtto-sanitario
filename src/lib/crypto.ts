import { hashSync, compareSync } from "bcryptjs"

export function hashPassword(password: string): string {
  return hashSync(password, 10)
}

export function verifyPassword(password: string, hashed: string): boolean {
  return compareSync(password, hashed)
}
