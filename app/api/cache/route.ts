import { NextRequest, NextResponse } from "next/server";
import { getCacheStats, clearInMemoryCache } from "@/lib/cache";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "stats":
        const stats = getCacheStats();
        return NextResponse.json(stats);

      case "clear":
        clearInMemoryCache();
        return NextResponse.json({
          message: "In-memory cache cleared successfully",
        });

      default:
        return NextResponse.json({
          message: "Cache API",
          availableActions: [
            "stats - Get cache statistics",
            "clear - Clear in-memory cache",
            "revalidate - Revalidate GitHub API cache",
          ],
        });
    }
  } catch (error) {
    console.error("Cache API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function generateStaticParams() {
  return [];
}
