import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = await db.vendorCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { displayOrder: "asc" },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
