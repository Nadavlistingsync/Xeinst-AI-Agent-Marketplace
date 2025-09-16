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
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/oauth/slack/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      throw new Error(`Slack OAuth error: ${tokenData.error}`);
    }

    // Get team info
    const teamInfoResponse = await fetch('https://slack.com/api/team.info', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const teamInfo = await teamInfoResponse.json();

    // Store connected account
    await prisma.connectedAccount.upsert({
      where: {
        userId_agentId_platform: {
          userId,
          agentId,
          platform: 'slack'
        }
      },
      update: {
        platformUserId: tokenData.authed_user.id,
        platformUserName: tokenData.authed_user.name,
        credentials: encrypt(JSON.stringify({
          access_token: tokenData.access_token,
          team_id: tokenData.team.id,
          team_name: teamInfo.team?.name || 'Unknown Team',
          bot_user_id: tokenData.bot_user_id,
          scope: tokenData.scope
        })),
        status: 'connected',
        lastUsed: new Date()
      },
      create: {
        userId,
        agentId,
        platform: 'slack',
        platformUserId: tokenData.authed_user.id,
        platformUserName: tokenData.authed_user.name,
        credentials: encrypt(JSON.stringify({
          access_token: tokenData.access_token,
          team_id: tokenData.team.id,
          team_name: teamInfo.team?.name || 'Unknown Team',
          bot_user_id: tokenData.bot_user_id,
          scope: tokenData.scope
        })),
        permissions: tokenData.scope.split(','),
        status: 'connected'
      }
    });

    // Redirect back to agent setup or specified URL
    const redirectTo = redirectUrl || `${process.env.NEXTAUTH_URL}/agent-setup?success=slack_connected`;
    return NextResponse.redirect(redirectTo);

  } catch (error) {
    console.error('Slack OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/agent-setup?error=oauth_failed`
    );
  }
}
