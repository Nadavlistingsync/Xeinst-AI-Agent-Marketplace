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
  title: "Xeinst - AI Solutions for Your Business",
  description: "We build custom AI tools for free. You only pay if you love the product.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-black border-t border-white/10 mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-400 text-sm">© 2024 Xeinst. All rights reserved.</div>
                <div className="flex space-x-6">
                  <a href="/terms" className="text-white/80 hover:text-blue-400 transition-all duration-300">Terms</a>
                  <a href="/privacy" className="text-white/80 hover:text-blue-400 transition-all duration-300">Privacy</a>
                  <a href="#contact" className="text-white/80 hover:text-blue-400 transition-all duration-300">Contact</a>
                </div>
              </div>
            </div>
          </footer>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
