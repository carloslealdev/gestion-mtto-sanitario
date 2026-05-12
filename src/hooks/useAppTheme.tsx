import { useEffect } from "react"
import { useAppSelector } from "@/store/hooks"

export function useAppTheme() {
  const theme = useAppSelector((state) => state.theme.theme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return theme
}