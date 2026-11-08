export interface Supply {
  id: string
  name: string
  code: string
  unit: "pieza" | "par" | "unidad" | "litro"
  optimalLevel?: number
}
