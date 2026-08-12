import { NextResponse } from "next/server"
import { autoTransitionBookings } from "@/lib/modules/booking/auto-transitions"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await autoTransitionBookings()
  return NextResponse.json(result)
}
