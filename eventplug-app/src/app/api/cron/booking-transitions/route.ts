import { NextResponse } from "next/server"
import { autoTransitionBookings } from "@/lib/modules/booking/auto-transitions"

export async function GET() {
  const result = await autoTransitionBookings()
  return NextResponse.json(result)
}
