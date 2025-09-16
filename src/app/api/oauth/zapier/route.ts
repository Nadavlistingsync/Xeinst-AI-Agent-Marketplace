import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth[...nextauth]/route';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { agentId, platform, redirectUrl } = await request.json();

    // Zapier OAuth configuration
    const clientId = process.env.ZAPIER_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/oauth/zapier/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Zapier OAuth not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      agentId,
      platform,
      redirectUrl
    })).toString('base64');

    // Zapier OAuth URL
    const authUrl = new URL('https://zapier.com/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'zaps:read zaps:execute webhooks:manage');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({
      authUrl: authUrl.toString()
    });

  } catch (error) {
    console.error('Zapier OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to start OAuth flow' },
      { status: 500 }
    );
  }
}
