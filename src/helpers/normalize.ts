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