import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { users } from "@/mock-data/users"
import type { RootState } from "../index"

export type AuthUserRole = "admin" | "encargado" | "general"

export interface AuthUser {
  username: string
  name: string
  role: AuthUserRole
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

function mapWorkerRoleToAuthRole(workerRole: string): AuthUserRole {
  return workerRole === "trabajador-encargado" ? "encargado" : "general"
}

export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async ({ username, password }: { username: string; password: string }, { getState }) => {
    const foundUser = users.find((u) => u.username === username && u.password === password)

    if (!foundUser) {
      throw new Error("Usuario o contraseña incorrectos")
    }

    let role: AuthUserRole = foundUser.role as AuthUserRole

    if (foundUser.role !== "admin") {
      const state = getState() as RootState
      const worker = state.workers.workers.find((w) => w.cedula.replace("V-", "") === username)
      if (worker) {
        role = mapWorkerRoleToAuthRole(worker.role)
      }
    }

    return {
      username: foundUser.username,
      name: foundUser.name,
      role,
    }
  }
)

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
          role: foundUser.role as AuthUserRole,
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
    updateUserRoleByCedula: (
      state,
      action: PayloadAction<{ cedula: string; workerRole: string }>
    ) => {
      const cedulaWithoutV = action.payload.cedula.replace("V-", "")
      if (state.user && state.user.username === cedulaWithoutV) {
        state.user.role = mapWorkerRoleToAuthRole(action.payload.workerRole)
        saveState(state)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
        state.error = null
        saveState(state)
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.error = action.error.message || "Error desconocido"
      })
  },
})

function saveState(state: AuthState) {
  try {
    localStorage.setItem("authState", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving auth state:", e)
  }
}

export const { login, logout, clearError, updateUserRoleByCedula } = authSlice.actions
export default authSlice.reducer