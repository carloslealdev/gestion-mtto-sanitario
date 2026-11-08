import { beforeEach, describe, expect, it, vi } from "vitest"

const txGet = vi.hoisted(() => vi.fn())
const txSet = vi.hoisted(() => vi.fn())

vi.mock("@/lib/firestore", () => ({
  getAllDocuments: vi.fn(),
  createDocument: vi.fn(),
  getDocRef: (_collection: string, id: string) => ({ id }),
  runTransaction: async (work: (tx: { get: unknown; set: unknown }) => Promise<unknown>) =>
    work({ get: txGet, set: txSet }),
}))

import { setReceivedItems, updateReservationStatus } from "./reservationsService"

const storedReservation = {
  team: "G1",
  items: [{ item: "guantes", quantity: 2 }],
  status: "pendiente",
  createdAt: "2026-01-01",
}

describe("updateReservationStatus", () => {
  beforeEach(() => {
    txGet.mockReset()
    txSet.mockReset()
  })

  it("stores the new status on the existing document", async () => {
    txGet.mockResolvedValue({
      exists: () => true,
      data: () => storedReservation,
    })

    await updateReservationStatus("res-1", "cancelada")

    expect(txSet).toHaveBeenCalledWith(
      { id: "res-1" },
      { id: "res-1", ...storedReservation, status: "cancelada" },
    )
  })

  it("throws when the reservation does not exist and writes nothing", async () => {
    txGet.mockResolvedValue({ exists: () => false, data: () => undefined })

    await expect(updateReservationStatus("missing", "cancelada")).rejects.toThrow(
      "Reservation not found",
    )
    expect(txSet).not.toHaveBeenCalled()
  })
})

describe("setReceivedItems", () => {
  beforeEach(() => {
    txGet.mockReset()
    txSet.mockReset()
  })

  it("stores the received items without touching other fields", async () => {
    txGet.mockResolvedValue({
      exists: () => true,
      data: () => storedReservation,
    })

    const receivedItems = [{ item: "guantes", quantity: 1 }]
    await setReceivedItems("res-1", receivedItems)

    expect(txSet).toHaveBeenCalledWith(
      { id: "res-1" },
      { id: "res-1", ...storedReservation, receivedItems },
    )
  })
})
