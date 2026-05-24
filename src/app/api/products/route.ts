import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { releaseExpiredReservations } from "../../../lib/cleanup";
import { ensureInventorySeeded } from "../../../lib/seed";

export async function GET() {
  await ensureInventorySeeded();

  await releaseExpiredReservations();

  const products = await prisma.product.findMany({
    include: {
      stocks: {
        include: {
          warehouse: true
        }
      }
    }
  });

  return NextResponse.json(products);
}