import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { securityManager, addWatermark } from "@/lib/security";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Agency Website - Copyright Protected",
  description: "AI Agency Website - Protected by copyright law. Unauthorized use prohibited.",
  keywords: "AI, Agency, Website, Copyright, Protected, Licensed",
  authors: [{ name: "AI Agency Website Team" }],
  creator: "AI Agency Website",
  publisher: "AI Agency Website",
  robots: {
    index: false, // Prevent indexing to protect content
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "AI Agency Website - Copyright Protected",
    description: "AI Agency Website - Protected by copyright law. Unauthorized use prohibited.",
    type: "website",
    locale: "en_US",
    siteName: "AI Agency Website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agency Website - Copyright Protected",
    description: "AI Agency Website - Protected by copyright law. Unauthorized use prohibited.",
  },
  other: {
    "copyright": "Copyright (c) 2024 AI Agency Website. All rights reserved.",
    "license": "MIT with commercial restrictions",
    "watermark": "AI_AGENCY_2024",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize security measures
  const sessionInfo = securityManager.getSessionInfo();
  
  return (
    <html lang="en" data-watermark={sessionInfo.watermark} data-session={sessionInfo.sessionId}>
      <head>
        {/* Copyright and license notices */}
        <meta name="copyright" content="Copyright (c) 2024 AI Agency Website. All rights reserved." />
        <meta name="license" content="MIT with commercial restrictions" />
        <meta name="watermark" content="AI_AGENCY_2024" />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        
        {/* Security meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Hidden watermark in HTML */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Copyright protection
              console.log('%cCopyright (c) 2024 AI Agency Website. All rights reserved.', 'color: #ff0000; font-weight: bold;');
              console.log('%cThis software is protected by copyright law.', 'color: #ff0000; font-weight: bold;');
              console.log('%cUnauthorized use, copying, or distribution is strictly prohibited.', 'color: #ff0000; font-weight: bold;');
              
              // Watermarking
              window.__AI_AGENCY_WATERMARK__ = '${sessionInfo.watermark}';
              window.__AI_AGENCY_SESSION__ = '${sessionInfo.sessionId}';
              
              // Anti-tampering
              if (typeof window !== 'undefined') {
                Object.freeze(window.__AI_AGENCY_WATERMARK__);
                Object.freeze(window.__AI_AGENCY_SESSION__);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} data-watermark={sessionInfo.watermark}>
        <Providers>
          <Navbar />
          <MotionWrapper>
            {children}
          </MotionWrapper>
          <Footer />
        </Providers>
        
        {/* Hidden watermark in footer */}
        <div style={{ display: 'none' }} data-watermark={sessionInfo.watermark}>
          {addWatermark('')}
        </div>
        
        {/* Copyright notice */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          fontSize: '10px', 
          color: '#ccc', 
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          © 2024 AI Agency Website. All rights reserved.
        </div>
      </body>
    </html>
  );
}