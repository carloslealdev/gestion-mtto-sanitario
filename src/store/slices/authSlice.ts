import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { loginWithCedula, logoutUser, registerUser } from "@/services/authService"

export type AuthUserRole = "admin" | "encargado" | "general"

export interface AuthUser {
  username: string
  name: string
  role: AuthUserRole
  uid: string
}

interface AuthState {
  isAuthenticated: boolean
  initializing: boolean
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  initializing: true,
  user: null,
  token: null,
  loading: false,
  error: null,
}

export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async ({ username, password }: { username: string; password: string }) => {
    const result = await loginWithCedula(username, password)
    return {
      username: result.profile.cedula,
      name: result.profile.name,
      role: result.profile.role,
      uid: result.profile.uid,
      token: result.idToken,
    }
  }
)

export const registerUserAsync = createAsyncThunk(
  "auth/registerUserAsync",
  async ({
    cedula,
    password,
    name,
    role,
  }: {
    cedula: string
    password: string
    name: string
    role: AuthUserRole
  }) => {
    await registerUser(cedula, password, name, role)
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthFromFirebase(
      state,
      action: {
        payload: {
          user: AuthUser
          token: string
        } | null
      }
    ) {
      state.initializing = false
      if (action.payload) {
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      } else {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      }
    },
    logout(state) {
      logoutUser()
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
    updateUserRoleByCedula(
      state,
      action: { payload: { cedula: string; workerRole: string } }
    ) {
      const cedulaWithoutV = action.payload.cedula.replace("V-", "")
      if (state.user && state.user.username === cedulaWithoutV) {
        state.user.role =
          action.payload.workerRole === "trabajador-encargado"
            ? "encargado"
            : "general"
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = {
          username: action.payload.username,
          name: action.payload.name,
          role: action.payload.role,
          uid: action.payload.uid,
        }
        state.token = action.payload.token
        state.error = null
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error de autenticación"
      })
      .addCase(registerUserAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Error al registrar usuario"
      })
  },
})

export const { setAuthFromFirebase, logout, clearError, updateUserRoleByCedula } =
  authSlice.actions
export default authSlice.reducer
