import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.WEBHOOK_SECRET;

    // Verify webhook secret
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = await request.json();
    
    // Log the rebuild request
    console.log('Documentation rebuild triggered:', {
      timestamp: new Date().toISOString(),
      repository: payload.repository?.full_name,
      ref: payload.ref,
      commits: payload.commits?.length || 0
    });

    // Trigger GitHub Actions workflow
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || 'solutionforest';
    const repoName = process.env.GITHUB_REPOSITORY_NAME || 'plugins-doc-site';

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'rebuild-docs',
          client_payload: {
            source: 'webhook',
            repository: payload.repository?.full_name,
            ref: payload.ref,
            timestamp: new Date().toISOString()
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Documentation rebuild triggered',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  
  if (challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return NextResponse.json({
    service: 'Documentation Rebuild Webhook',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
