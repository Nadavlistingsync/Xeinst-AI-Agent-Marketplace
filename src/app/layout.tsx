import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from '@/components/Header';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Agency",
  description: "Your AI Agency Platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
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
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black rounded shadow-lg transition-all duration-300"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="pt-20">
            {children}
          </main>
          <footer className="bg-black/80 border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <div>© 2024 Xeinst. All rights reserved.</div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
