import crypto from 'crypto';

export interface WebhookSignature {
  signature: string;
  timestamp: string;
  algorithm: string;
}

export interface WebhookPayload {
  agentId: string;
  userId: string;
  input: any;
  parameters?: any;
  requestId: string;
  timestamp: string;
}

export class WebhookSigning {
  /**
   * Generate a webhook secret for an agent
   */
  static generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a signature for a webhook payload
   */
  static createSignature(payload: string, secret: string, timestamp: string): string {
    const message = `${timestamp}.${payload}`;
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
  }

  /**
   * Verify a webhook signature
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string,
    timestamp: string,
    tolerance: number = 300 // 5 minutes
  ): boolean {
    try {
      // Check timestamp tolerance
      const now = Math.floor(Date.now() / 1000);
      const payloadTimestamp = parseInt(timestamp);
      
      if (Math.abs(now - payloadTimestamp) > tolerance) {
        console.warn('Webhook timestamp outside tolerance window');
        return false;
      }

      // Create expected signature
      const expectedSignature = this.createSignature(payload, secret, timestamp);
      
      // Use constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Parse webhook signature header
   */
  static parseSignatureHeader(header: string): WebhookSignature | null {
    try {
      // Expected format: "t=timestamp,v1=signature"
      const parts = header.split(',');
      const signature: Partial<WebhookSignature> = {};

      for (const part of parts) {
        const [key, value] = part.split('=');
        switch (key) {
          case 't':
            signature.timestamp = value;
            break;
          case 'v1':
            signature.signature = value;
            signature.algorithm = 'sha256';
            break;
        }
      }

      if (!signature.timestamp || !signature.signature) {
        return null;
      }

      return signature as WebhookSignature;
    } catch (error) {
      console.error('Error parsing signature header:', error);
      return null;
    }
  }

  /**
   * Create a signed webhook payload
   */
  static createSignedPayload(
    payload: WebhookPayload,
    secret: string
  ): { payload: string; signature: string; timestamp: string } {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadString = JSON.stringify(payload);
    const signature = this.createSignature(payloadString, secret, timestamp);

    return {
      payload: payloadString,
      signature,
      timestamp
    };
  }

  /**
   * Verify incoming webhook request
   */
  static async verifyWebhookRequest(
    request: Request,
    secret: string
  ): Promise<{ isValid: boolean; payload?: any; error?: string }> {
    try {
      const signatureHeader = request.headers.get('x-webhook-signature');
      
      if (!signatureHeader) {
        return { isValid: false, error: 'Missing signature header' };
      }

      const signature = this.parseSignatureHeader(signatureHeader);
      
      if (!signature) {
        return { isValid: false, error: 'Invalid signature format' };
      }

      // Get the raw body as text for Next.js
      const body = await request.text();
      
      if (!body) {
        return { isValid: false, error: 'Missing request body' };
      }
      
      const isValid = this.verifySignature(
        body,
        signature.signature,
        secret,
        signature.timestamp
      );

      if (!isValid) {
        return { isValid: false, error: 'Invalid signature' };
      }

      // Parse the JSON payload
      let payload;
      try {
        payload = JSON.parse(body);
      } catch (parseError) {
        return { isValid: false, error: 'Invalid JSON payload' };
      }

      return { isValid: true, payload };
    } catch (error) {
      console.error('Error verifying webhook request:', error);
      return { isValid: false, error: 'Verification failed' };
    }
  }

  /**
   * Generate webhook headers for outbound requests
   */
  static generateWebhookHeaders(payload: string, secret: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.createSignature(payload, secret, timestamp);

    return {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `t=${timestamp},v1=${signature}`,
      'User-Agent': 'Xeinst-Agent-Platform/1.0'
    };
  }
}

/**
 * Middleware for verifying webhook signatures
 */
export function withWebhookVerification(secret: string) {
  return function(handler: Function) {
    return async function(request: Request, ...args: any[]) {
      const verification = await WebhookSigning.verifyWebhookRequest(request, secret);
      
      if (!verification.isValid) {
        return new Response(
          JSON.stringify({ error: verification.error }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Add verified payload to request
      (request as any).verifiedPayload = verification.payload;
      
      return handler(request, ...args);
    };
  };
}

