import { NextResponse } from "next/server"
import { expireQuotations } from "@/lib/modules/quote/expire-quotations"

export async function GET() {
  const result = await expireQuotations()
  return NextResponse.json(result)
}
