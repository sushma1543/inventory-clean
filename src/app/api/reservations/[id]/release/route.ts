
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: any
) {
  const { id } = await params;

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
      { error: "Reservation cannot be released" },
      { status: 400 }
    );
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
        status: "RELEASED"
      }
    });
  });

  return NextResponse.json({
    success: true
  });
}
