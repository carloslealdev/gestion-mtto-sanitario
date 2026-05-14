import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { logout, clearError, loginAsync } from "@/store/slices/authSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Factory } from "lucide-react"

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { error, user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case "admin":
          navigate("/")
          break
        case "encargado":
          navigate("/encargado")
          break
        case "general":
          navigate("/general")
          break
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(logout())
    dispatch(loginAsync({ username, password }))
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    if (error) {
      dispatch(clearError())
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) {
      dispatch(clearError())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Factory className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Gestión MTTO</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuario
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Usuario o Cédula"
                value={username}
                onChange={handleUsernameChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Admin: admin / 123456</p>
            <p>Trabajadores: [cédula] / 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}