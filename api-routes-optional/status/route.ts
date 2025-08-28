import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/lib/repo-config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case "plugins":
      return NextResponse.json({
        plugins: repositories.map((repo) => ({
          url: repo.repository_url,
          latest_version: repo.latest_version,
          versions: repo.versions.length,
        })),
      });

    case "health":
      return NextResponse.json({
        status: "healthy",
        github_token: !!process.env.GITHUB_TOKEN,
        plugins_count: repositories.length,
        timestamp: new Date().toISOString(),
      });

    default:
      return NextResponse.json({
        message: "Available actions: plugins, health",
        example: "/api/status?action=health",
      });
  }
}

// export async function generateStaticParams() {
//   return [];
// }
