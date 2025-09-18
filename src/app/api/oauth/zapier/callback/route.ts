import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { encrypt } from '../../../../../lib/encryption';

export const dynamic = 'force-dynamic';

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

    // Decode state parameter
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId, agentId, platform, redirectUrl } = stateData;

    // Exchange code for access token
    const tokenResponse = await fetch('https://zapier.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ZAPIER_CLIENT_ID!,
        client_secret: process.env.ZAPIER_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/oauth/zapier/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user info from Zapier
    const userResponse = await fetch('https://zapier.com/api/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // Store encrypted credentials
    const encryptedCredentials = encrypt(JSON.stringify({
      access_token,
      refresh_token,
      expires_at: Date.now() + (expires_in * 1000),
    }));

    // Save to database
    await prisma.connectedAccount.create({
      data: {
        userId,
        agentId,
        platform: 'zapier',
        platformUserId: userData.id.toString(),
        platformUserName: userData.name || userData.email,
        credentials: encryptedCredentials,
        permissions: ['zaps:read', 'zaps:execute', 'webhooks:manage'],
        status: 'connected',
        lastUsed: new Date(),
      },
    });

    // Redirect back to agent setup
    return NextResponse.redirect(
      `${redirectUrl}?success=zapier_connected&agentId=${agentId}`
    );

  } catch (error) {
    console.error('Zapier OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/agent-setup?error=oauth_failed`
    );
  }
}
