import { Prisma } from "@prisma/client"
import { InsufficientInventoryError } from "@/lib/errors"
import { db } from "@/lib/db"

export async function reserveInventory(
  tx: Prisma.TransactionClient,
  rentalItemId: string,
  eventDate: Date,
  quantity: number
): Promise<void> {
  const item = await tx.rentalItem.findUniqueOrThrow({
    where: { id: rentalItemId },
  })

  const inventory = await tx.rentalInventory.upsert({
    where: { rentalItemId_eventDate: { rentalItemId, eventDate } },
    create: { rentalItemId, eventDate, reservedQty: 0 },
    update: {},
  })

  const available = item.totalQuantity - inventory.reservedQty
  if (available < quantity) {
    throw new InsufficientInventoryError(
      `Only ${available} units available for ${item.name} on ${eventDate.toISOString().split("T")[0]}. Requested: ${quantity}`
    )
  }

  await tx.rentalInventory.update({
    where: { rentalItemId_eventDate: { rentalItemId, eventDate } },
    data: { reservedQty: { increment: quantity } },
  })
}

export async function releaseInventory(
  tx: Prisma.TransactionClient,
  rentalItemId: string,
  eventDate: Date,
  quantity: number
): Promise<void> {
  await tx.rentalInventory.update({
    where: { rentalItemId_eventDate: { rentalItemId, eventDate } },
    data: { reservedQty: { decrement: quantity } },
  })
}

export async function getAvailableQuantity(
  rentalItemId: string,
  eventDate: Date
): Promise<number> {
  const item = await db.rentalItem.findUniqueOrThrow({
    where: { id: rentalItemId },
  })
  const inventory = await db.rentalInventory.findUnique({
    where: { rentalItemId_eventDate: { rentalItemId, eventDate } },
  })
  return item.totalQuantity - (inventory?.reservedQty ?? 0)
}
