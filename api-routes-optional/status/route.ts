import { NextRequest, NextResponse } from "next/server";
import { plugins } from "@/lib/plugins";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'plugins':
      return NextResponse.json({
        plugins: plugins.map(p => ({
          name: p.name,
          slug: p.slug,
          description: p.description,
          latest_version: p.latest_version,
          versions: p.versions.length
        }))
      });

    case 'health':
      return NextResponse.json({
        status: 'healthy',
        github_token: !!process.env.GITHUB_TOKEN,
        plugins_count: plugins.length,
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json({
        message: 'Available actions: plugins, health',
        example: '/api/status?action=health'
      });
  }
}
