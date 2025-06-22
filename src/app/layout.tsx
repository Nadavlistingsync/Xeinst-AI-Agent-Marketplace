import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from '@/components/Header';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className={`${montserrat.variable} font-sans ${inter.className}`}>
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
          <footer className="bg-black border-t border-[#00b4ff]/10 mt-16">
            <div className="container mx-auto px-4 py-10">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                <div className="text-gray-400 text-base font-medium">© 2024 Xeinst. All rights reserved.</div>
                <div className="flex space-x-8 items-center">
                  <a href="/terms" className="text-white/80 hover:text-[#00b4ff] transition-all duration-300 text-lg font-semibold">Terms</a>
                  <a href="/privacy" className="text-white/80 hover:text-[#00b4ff] transition-all duration-300 text-lg font-semibold">Privacy</a>
                  <a href="#contact" className="text-white/80 hover:text-[#00b4ff] transition-all duration-300 text-lg font-semibold">Contact</a>
                  <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="ml-4 text-[#00b4ff] hover:text-white transition-colors duration-300">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M22 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 16.616 4c-2.485 0-4.5 2.015-4.5 4.5 0 .353.04.697.116 1.027C8.08 9.36 5.1 7.884 3.148 5.684c-.387.664-.61 1.437-.61 2.26 0 1.56.795 2.936 2.005 3.744a4.48 4.48 0 0 1-2.037-.563v.057c0 2.18 1.55 4.002 3.604 4.417-.377.103-.775.158-1.185.158-.29 0-.57-.028-.844-.08.57 1.78 2.225 3.078 4.188 3.113A8.98 8.98 0 0 1 2 19.07a12.67 12.67 0 0 0 6.88 2.017c8.26 0 12.785-6.84 12.785-12.785 0-.195-.004-.39-.013-.583A9.14 9.14 0 0 0 24 4.59a8.98 8.98 0 0 1-2.6.713Z" fill="currentColor"/></svg>
                  </a>
                  <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-[#00b4ff] hover:text-white transition-colors duration-300">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v4.75z" fill="currentColor"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
          <Analytics />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
