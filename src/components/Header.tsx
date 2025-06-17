'use client';

import { motion, useScroll } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Services', href: '/services' },
    { label: 'AI Agents', href: '/marketplace' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-[#00b4ff]/20 shadow-2xl' : 'bg-transparent'
    }`}>
      <div className="container">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="AI Agency" width={40} height={40} />
            <span className="text-xl font-bold text-white">AI Agency</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
              AI Agents
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 text-white bg-[#00AFFF] rounded-lg hover:bg-[#0090cc] transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-gray-300 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00b4ff]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.nav
        id="mobile-menu"
        className="md:hidden"
        initial={false}
        animate={isMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto" },
          closed: { opacity: 0, height: 0 }
        }}
        transition={{ duration: 0.3 }}
        aria-label="Mobile navigation"
        role="navigation"
      >
        <div className="bg-black/95 backdrop-blur-xl border-t border-[#00b4ff]/20 rounded-b-2xl shadow-2xl">
          <ul className="px-4 pt-4 pb-6 space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block text-gray-300 hover:text-white transition-colors text-lg font-semibold py-3 px-4 rounded-lg hover:bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00b4ff]"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="block w-full text-center text-gray-300 hover:text-white transition-colors text-lg font-semibold px-8 py-3 mt-2 bg-[#00AFFF] rounded-lg hover:bg-[#0090cc] transition-colors"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Login"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      </motion.nav>
    </header>
  );
} 