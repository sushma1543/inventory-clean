
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIdempotentResponse, saveIdempotentResponse } from "@/lib/idempotency";

export async function POST(
  req: Request,
  { params }: any
) {
  const { id } = await params;

  const idemKey = req.headers.get("idempotency-key");
  const route = `/api/reservations/${id}/confirm`;

  if (idemKey) {
    const cached = await getIdempotentResponse(idemKey, "POST", route);
    if (cached) return NextResponse.json(cached.body, { status: cached.statusCode });
  }

  const reservation = await prisma.reservation.findUnique({
    where: {
      id
    }
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  if (reservation.status !== "PENDING") {
    return NextResponse.json(
      { error: "Reservation is not pending" },
      { status: 400 }
    );
  }

  if (reservation.expiresAt < new Date()) {
    const body = { error: "Reservation expired" };

    if (idemKey) await saveIdempotentResponse(idemKey, "POST", route, 410, body);

    return NextResponse.json(body, { status: 410 });
  }

  await prisma.$transaction(async (tx) => {

    const stock = await tx.stock.findFirst({
      where: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId
      }
    });

    if (!stock) return;

    await tx.stock.update({
      where: {
        id: stock.id
      },
      data: {
        totalUnits: {
          decrement: reservation.quantity
        },
        reservedUnits: {
          decrement: reservation.quantity
        }
      }
    });

    await tx.reservation.update({
      where: {
        id: reservation.id
      },
      data: {
        status: "CONFIRMED"
      }
    });
  });

  const body = { success: true };

  if (idemKey) await saveIdempotentResponse(idemKey, "POST", route, 200, body);

  return NextResponse.json(body);
}
