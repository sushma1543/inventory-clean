
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { releaseExpiredReservations } from "@/lib/cleanup";
import { getIdempotentResponse, saveIdempotentResponse } from "@/lib/idempotency";

export async function POST(req: Request) {

  await releaseExpiredReservations();

  const idemKey = req.headers.get("idempotency-key");

  if (idemKey) {
    const cached = await getIdempotentResponse(idemKey, "POST", "/api/reservations");
    if (cached) {
      return NextResponse.json(cached.body, { status: cached.statusCode });
    }
  }

  const body = await req.json();

  const {
    productId,
    warehouseId,
    quantity,
    shippingAddress
  } = body;

  try {

    const reservation = await prisma.$transaction(
      async (tx) => {

        const stock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId,
            }
          }
        });

        if (!stock) {
          throw new Error("INSUFFICIENT");
        }

        const available = stock.totalUnits - stock.reservedUnits;

        if (available < quantity) {
          throw new Error("INSUFFICIENT");
        }

        await tx.stock.update({
          where: { id: stock.id },
          data: {
            reservedUnits: {
              increment: quantity
            }
          }
        });

        return tx.reservation.create({
          data: {
            productId,
            warehouseId,
            quantity,
            shippingAddress: shippingAddress ?? null,
            status: "PENDING",
            expiresAt: new Date(
              Date.now() + 10 * 60 * 1000
            )
          }
        });
      }
    );

    if (idemKey) {
      await saveIdempotentResponse(idemKey, "POST", "/api/reservations", 200, reservation);
    }

    return NextResponse.json(reservation);

  } catch (error) {

    const body = { error: error instanceof Error && error.message === "INSUFFICIENT" ? "Not enough stock available" : "Failed to create reservation" };
    const status = error instanceof Error && error.message === "INSUFFICIENT" ? 409 : 500;

    if (idemKey) {
      await saveIdempotentResponse(idemKey, "POST", "/api/reservations", status, body);
    }

    return NextResponse.json(body, { status });
  }
}

export async function GET() {
  await releaseExpiredReservations();

  const reservations = await prisma.reservation.findMany({
    include: {
      product: true,
      warehouse: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(reservations);
}
