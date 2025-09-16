import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { agentId, redirectUrl } = await request.json();

    // Gmail OAuth configuration
    const clientId = process.env.GMAIL_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/oauth/gmail/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Gmail OAuth not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      agentId,
      platform: 'gmail',
      redirectUrl
    })).toString('base64');

    // Gmail OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({
      authUrl: authUrl.toString()
    });

  } catch (error) {
    console.error('Gmail OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to start OAuth flow' },
      { status: 500 }
    );
  }
}
