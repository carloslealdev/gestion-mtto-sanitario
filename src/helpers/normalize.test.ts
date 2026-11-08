import { describe, expect, it } from "vitest"
import {
  extractLineNumber,
  generateIdFromName,
  normalizeName,
  normalizeSupplyName,
} from "./normalize"

describe("normalizeName", () => {
  it("capitalizes each underscore-separated word and joins with spaces", () => {
    expect(normalizeName("traje_antiderrame")).toBe("Traje Antiderrame")
  })

  it("lowercases the rest of each word", () => {
    expect(normalizeName("LINEA_DE_PRODUCCION")).toBe("Linea De Produccion")
  })

  it("capitalizes a single lowercase word", () => {
    expect(normalizeName("guantes")).toBe("Guantes")
  })
})

describe("normalizeSupplyName", () => {
  it("returns the curated label for known supplies", () => {
    expect(normalizeSupplyName("traje_antiderrame")).toBe("Traje Antiderrame")
    expect(normalizeSupplyName("guantes")).toBe("Guantes")
    expect(normalizeSupplyName("esponjas")).toBe("Espongas")
    expect(normalizeSupplyName("gerdex")).toBe("Gerdex")
  })

  it("falls back to normalizeName for unknown supplies", () => {
    expect(normalizeSupplyName("alcohol_en_gel")).toBe("Alcohol En Gel")
  })
})

describe("generateIdFromName", () => {
  it("builds PREFIX-NNN from the first three letters and the first number", () => {
    expect(generateIdFromName("LAM 001")).toBe("LAM-001")
  })

  it("pads a short number to three digits", () => {
    expect(generateIdFromName("LAM-7")).toBe("LAM-007")
  })

  it("uses 000 when the name has no number", () => {
    expect(generateIdFromName("LAM")).toBe("LAM-000")
  })

  it("ignores digits, spaces and hyphens when building the prefix", () => {
    expect(generateIdFromName("Línea 12")).toBe("LÍN-012")
  })
})

describe("extractLineNumber", () => {
  it("returns the first number found in the name", () => {
    expect(extractLineNumber("LAM 001")).toBe("001")
    expect(extractLineNumber("Línea 12")).toBe("12")
  })

  it("returns an empty string when there is no number", () => {
    expect(extractLineNumber("LAM")).toBe("")
  })
})
