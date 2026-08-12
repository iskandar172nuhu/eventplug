import { NextResponse } from "next/server"
import { expireQuotations } from "@/lib/modules/quote/expire-quotations"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await expireQuotations()
  return NextResponse.json(result)
}
