import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { decrypt, encrypt } from '../../../lib/encryption';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let agentId, input, accountId;
  
  try {
    const requestData = await request.json();
    agentId = requestData.agentId;
    input = requestData.input;
    accountId = requestData.accountId;

    if (!agentId || !input) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get user's connected account
    const connectedAccount = await prisma.connectedAccount.findFirst({
      where: {
        id: accountId,
        userId: session.user.id,
        agentId: agentId,
        status: 'connected'
      }
    });

    if (!connectedAccount) {
      return NextResponse.json(
        { error: 'No connected account found' },
        { status: 400 }
      );
    }

    // Decrypt credentials
    const credentials = JSON.parse(decrypt(connectedAccount.credentials));
    
    // Check if token is expired and refresh if needed
    if (credentials.expires_at < Date.now()) {
      const refreshedCredentials = await refreshToken(connectedAccount.platform, credentials);
      if (refreshedCredentials) {
        // Update stored credentials
        await prisma.connectedAccount.update({
          where: { id: connectedAccount.id },
          data: {
            credentials: encrypt(JSON.stringify(refreshedCredentials)),
            lastUsed: new Date()
          }
        });
        credentials.access_token = refreshedCredentials.access_token;
      } else {
        return NextResponse.json(
          { error: 'Account credentials expired and could not be refreshed' },
          { status: 401 }
        );
      }
    }

    // Prepare enhanced request with user credentials
    const enhancedRequest = {
      input,
      userId: session.user.id,
      userEmail: session.user.email,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agent: {
        id: agent.id,
        name: agent.name,
        framework: agent.framework
      },
      userCredentials: {
        platform: connectedAccount.platform,
        accessToken: credentials.access_token,
        permissions: connectedAccount.permissions
      },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/agent-response`
    };

    // Call the agent's webhook with enhanced data
    let webhookResponse;
    let result;
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      webhookResponse = await fetch(agent.webhookUrl || agent.fileUrl || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Xeinst-Agent-Platform/1.0'
        },
        body: JSON.stringify(enhancedRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!webhookResponse.ok) {
        throw new Error(`Webhook responded with status ${webhookResponse.status}`);
      }

      result = await webhookResponse.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Agent took too long to respond');
      }
      throw error;
    }

    // Update last used timestamp
    await prisma.connectedAccount.update({
      where: { id: connectedAccount.id },
      data: { lastUsed: new Date() }
    });

    // Log the execution
    await prisma.agentExecution.create({
      data: {
        agentId: agent.id,
        userId: session.user.id,
        input: JSON.stringify(input),
        output: JSON.stringify(result),
        status: 'completed',
        executionTime: Date.now() - Date.now(), // This would be calculated properly
        requestId: enhancedRequest.requestId
      }
    });

    return NextResponse.json({
      success: true,
      result: result.result || result,
      requestId: enhancedRequest.requestId,
      agent: {
        id: agent.id,
        name: agent.name
      }
    });

  } catch (error) {
    console.error('Enhanced agent execution error:', error);
    
    // Log failed execution
    if (agentId) {
      try {
        await prisma.agentExecution.create({
          data: {
            agentId,
            userId: session.user.id,
            input: JSON.stringify({ input }),
            output: JSON.stringify({ error: error.message }),
            status: 'failed',
            executionTime: 0,
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        });
      } catch (logError) {
        console.error('Failed to log execution error:', logError);
      }
    }

    return NextResponse.json(
      { 
        error: 'Agent execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function refreshToken(platform: string, credentials: any): Promise<any> {
  try {
    switch (platform) {
      case 'make':
        return await refreshMakeToken(credentials);
      case 'zapier':
        return await refreshZapierToken(credentials);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Token refresh failed for ${platform}:`, error);
    return null;
  }
}

async function refreshMakeToken(credentials: any): Promise<any> {
  const response = await fetch('https://www.make.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.MAKE_CLIENT_ID!,
      client_secret: process.env.MAKE_CLIENT_SECRET!,
      refresh_token: credentials.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Make.com token');
  }

  const tokenData = await response.json();
  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || credentials.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in * 1000),
  };
}

async function refreshZapierToken(credentials: any): Promise<any> {
  const response = await fetch('https://zapier.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ZAPIER_CLIENT_ID!,
      client_secret: process.env.ZAPIER_CLIENT_SECRET!,
      refresh_token: credentials.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Zapier token');
  }

  const tokenData = await response.json();
  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || credentials.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in * 1000),
  };
}
