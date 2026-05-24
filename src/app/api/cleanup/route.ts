import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/cleanup";

export async function GET() {
  try {
    await releaseExpiredReservations();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "cleanup failed" }, { status: 500 });
  }
}
