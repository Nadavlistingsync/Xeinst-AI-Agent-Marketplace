import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from '@/lib/enhanced-error-handling';

export async function POST(request: NextRequest) {
  return withEnhancedErrorHandling(async () => {
    const body = await request.json();
    const { webhookUrl, testInput } = body;

    if (!webhookUrl) {
      throw new EnhancedAppError(
        'Webhook URL is required',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        'MISSING_WEBHOOK_URL',
        null,
        false,
        undefined,
        'Please provide a webhook URL to test',
        ['Enter a valid webhook URL', 'Check the URL format', 'Ensure the endpoint is accessible']
      );
    }

    try {
      // Test the webhook with a simple request
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Agency-Webhook-Tester/1.0',
        },
        body: JSON.stringify(testInput || { test: true, message: 'Webhook test from AI Agency' }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: 'Webhook test successful',
          status: response.status,
          response: responseData,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Webhook returned status ${response.status}`,
          status: response.status,
          response: responseData,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({
          success: false,
          message: `Webhook test failed: ${error.message}`,
          error: error.message,
        });
      }
      
      return NextResponse.json({
        success: false,
        message: 'Webhook test failed with unknown error',
        error: 'Unknown error',
      });
    }
  }, { endpoint: '/api/agents/test-webhook', method: 'POST' });
}
