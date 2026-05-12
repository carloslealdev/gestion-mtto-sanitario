import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { users } from "@/mock-data/users"

export type UserRole = "admin" | "encargado" | "general"

export interface AuthUser {
  username: string
  name: string
  role: UserRole
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  error: string | null
}

const loadState = (): AuthState => {
  try {
    const stored = localStorage.getItem("authState")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Error loading auth state:", e)
  }
  return { isAuthenticated: false, user: null, error: null }
}

const initialState: AuthState = loadState()

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ username: string; password: string }>
    ) => {
      const { username, password } = action.payload
      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      )

      if (foundUser) {
        state.isAuthenticated = true
        state.user = {
          username: foundUser.username,
          name: foundUser.name,
          role: foundUser.role as UserRole,
        }
        state.error = null
        saveState(state)
      } else {
        state.error = "Usuario o contraseña incorrectos"
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
      saveState(state)
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

function saveState(state: AuthState) {
  try {
    localStorage.setItem("authState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving auth state:", e)
  }
}

export const { login, logout, clearError } = authSlice.actions
export default authSlice.reducer