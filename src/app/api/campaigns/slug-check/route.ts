import { NextRequest, NextResponse } from "next/server";
import { isSlugTaken } from "@/lib/campaign-store";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }
  return NextResponse.json({ available: !(await isSlugTaken(slug)) });
}
