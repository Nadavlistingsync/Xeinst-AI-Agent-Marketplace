import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'AI Agent Marketplace';
    const description = searchParams.get('description') || 'Discover AI agents that flow like liquid intelligence';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #06b6d4 0%, transparent 50%)',
            position: 'relative',
          }}
        >
          {/* Floating bubbles */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(59, 130, 246, 0.3)',
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '60%',
              right: '20%',
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(139, 92, 246, 0.3)',
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '25%',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(6, 182, 212, 0.3)',
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
          />

          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '30px 40px 35px 45px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '40px',
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 50%, #3b82f6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              marginBottom: '20px',
              fontFamily: 'system-ui',
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
              fontFamily: 'system-ui',
            }}
          >
            {description}
          </div>

          {/* Brand */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'system-ui',
            }}
          >
            xeinst.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`);
    return new Response('Failed to generate image', { status: 500 });
  }
}
