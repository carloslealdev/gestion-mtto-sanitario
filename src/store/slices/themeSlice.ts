import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
}

const loadState = (): ThemeState => {
  try {
    const stored = localStorage.getItem("theme")
    if (stored === "light" || stored === "dark") {
      return { theme: stored }
    }
  } catch (e) {
    console.error("Error loading theme state:", e)
  }
  return { theme: "light" }
}

const initialState: ThemeState = loadState()

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      saveState(state)
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"
      saveState(state)
    },
  },
})

function saveState(state: ThemeState) {
  try {
    localStorage.setItem("theme", state.theme)
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(state.theme)
  } catch (e) {
    console.error("Error saving theme state:", e)
  }
}

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer