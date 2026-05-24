import { prisma } from "./prisma";

export async function releaseExpiredReservations() {

  const expired = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date()
      }
    }
  });

  for (const reservation of expired) {

    const stock = await prisma.stock.findFirst({
      where: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId
      }
    });

    if (!stock) continue;

    await prisma.stock.update({
      where: { id: stock.id },
      data: {
        reservedUnits: {
          decrement: reservation.quantity
        }
      }
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "RELEASED"
      }
    });
  }
}