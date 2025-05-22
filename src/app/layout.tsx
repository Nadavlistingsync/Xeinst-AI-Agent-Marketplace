import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from '@/components/Header';
import { Analytics } from '@vercel/analytics/react';

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "AI Agency",
  description: "Your AI Agency Platform",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} font-sans`}>
      <head>
        <meta name="description" content="We build custom AI tools for free. You only pay if you love the product." />
        <meta name="keywords" content="AI, artificial intelligence, machine learning, custom AI solutions" />
        <meta name="author" content="Xeinst" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://xeinst.com" />
        <meta property="og:url" content="https://xeinst.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Xeinst - AI Solutions for Your Business" />
        <meta property="og:description" content="We build custom AI tools for free. You only pay if you love the product." />
      </head>
      <body className="min-h-screen bg-black text-white antialiased">
        <Providers>
          <Header />
          <div className="pt-20">
            {children}
          </div>
          <footer className="bg-black border-t border-white/10 mt-16">
            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <div>© 2024 Xeinst. All rights reserved.</div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/terms" className="text-white hover:text-blue-400 transition">Terms</a>
                <a href="/privacy" className="text-white hover:text-blue-400 transition">Privacy</a>
                <a href="#contact" className="text-white hover:text-blue-400 transition">Contact</a>
              </div>
            </div>
          </footer>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
