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

import { approveEPPRequest } from "./eppRequestsService"

const storedRequest = {
  workerId: "V-123",
  workerName: "Ana Perez",
  status: "pendiente",
  items: [{ epp: "guantes", quantity: 2 }],
}

describe("approveEPPRequest", () => {
  beforeEach(() => {
    txGet.mockReset()
    txSet.mockReset()
  })

  it("marks the request approved and stores items and approved items", async () => {
    txGet.mockResolvedValue({
      exists: () => true,
      data: () => storedRequest,
    })

    const items = [{ epp: "guantes", quantity: 2 }]
    const approvedItems = [{ epp: "guantes", quantity: 1 }]

    await approveEPPRequest("req-1", items, approvedItems)

    expect(txSet).toHaveBeenCalledWith(
      { id: "req-1" },
      {
        id: "req-1",
        ...storedRequest,
        status: "aprobada",
        items,
        approvedItems,
      },
    )
  })

  it("throws when the request does not exist and writes nothing", async () => {
    txGet.mockResolvedValue({ exists: () => false, data: () => undefined })

    await expect(approveEPPRequest("missing", [], [])).rejects.toThrow(
      "EPP request not found",
    )
    expect(txSet).not.toHaveBeenCalled()
  })
})
