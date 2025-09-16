import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/agent-setup?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/agent-setup?error=missing_parameters`
      );
    }

    // Decode state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId, agentId, platform, redirectUrl } = stateData;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/oauth/gmail/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();

    // Store connected account
    await prisma.connectedAccount.upsert({
      where: {
        userId_agentId_platform: {
          userId,
          agentId,
          platform: 'gmail'
        }
      },
      update: {
        platformUserId: userInfo.id,
        platformUserName: userInfo.email,
        credentials: encrypt(JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in * 1000)
        })),
        status: 'connected',
        lastUsed: new Date()
      },
      create: {
        userId,
        agentId,
        platform: 'gmail',
        platformUserId: userInfo.id,
        platformUserName: userInfo.email,
        credentials: encrypt(JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in * 1000)
        })),
        permissions: ['gmail.readonly', 'gmail.send', 'gmail.modify'],
        status: 'connected'
      }
    });

    // Redirect back to agent setup or specified URL
    const redirectTo = redirectUrl || `${process.env.NEXTAUTH_URL}/agent-setup?success=gmail_connected`;
    return NextResponse.redirect(redirectTo);

  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/agent-setup?error=oauth_failed`
    );
  }
}
