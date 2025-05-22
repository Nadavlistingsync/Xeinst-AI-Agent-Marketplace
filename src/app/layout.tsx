import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xeinst - AI Solutions for Your Business",
  description: "We build custom AI tools for free. You only pay if you love the product.",
  viewport: "width=device-width, initial-scale=1",
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-black"
        >
          Skip to main content
        </a>
        <Navigation />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
