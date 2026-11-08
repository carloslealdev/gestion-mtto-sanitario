import { beforeEach, describe, expect, it, vi } from "vitest"

const txGet = vi.hoisted(() => vi.fn())
const txSet = vi.hoisted(() => vi.fn())

vi.mock("@/lib/firestore", () => ({
  getAllDocuments: vi.fn(),
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getDocRef: (_collection: string, id: string) => ({ id }),
  runTransaction: async (work: (tx: { get: unknown; set: unknown }) => Promise<unknown>) =>
    work({ get: txGet, set: txSet }),
}))

import { updateSupply } from "./suppliesService"

describe("updateSupply", () => {
  beforeEach(() => {
    txGet.mockReset()
    txSet.mockReset()
  })

  it("writes the merged document keeping the id and untouched fields", async () => {
    txGet.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: "Guantes", code: "G-01", unit: "par", optimalLevel: 4 }),
    })

    await updateSupply("abc", { name: "Guantes nitrilo" })

    expect(txSet).toHaveBeenCalledWith(
      { id: "abc" },
      {
        id: "abc",
        name: "Guantes nitrilo",
        code: "G-01",
        unit: "par",
        optimalLevel: 4,
      },
    )
  })

  it("throws when the document does not exist and writes nothing", async () => {
    txGet.mockResolvedValue({ exists: () => false, data: () => undefined })

    await expect(updateSupply("missing", { name: "X" })).rejects.toThrow(
      "Supply not found",
    )
    expect(txSet).not.toHaveBeenCalled()
  })
})
