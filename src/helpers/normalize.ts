export function normalizeName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function normalizeSupplyName(supply: string): string {
  const supplyLabels: Record<string, string> = {
    traje_antiderrame: "Traje Antiderrame",
    guantes: "Guantes",
    esponjas: "Espongas",
    gerdex: "Gerdex",
  }
  return supplyLabels[supply] || normalizeName(supply)
}

export function generateIdFromName(name: string): string {
  const cleaned = name.replace(/[\d\s-]+/g, "")
  const prefix = cleaned.substring(0, 3).toUpperCase()
  const match = name.match(/(\d+)/)
  const number = match ? match[1].padStart(3, "0") : "000"
  return `${prefix}-${number}`
}

export function extractLineNumber(name: string): string {
  const match = name.match(/(\d+)/)
  return match ? match[1] : ""
}