'use client';

import { motion, useScroll } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-wider text-white logo-glow hover:text-blue-400 transition-all duration-300"
            aria-label="Xeinst Home"
          >
            Xeinst
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10" role="navigation" aria-label="Main navigation">
            {menuItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-white/90 hover:text-blue-400 focus:text-blue-400 transition-all duration-200 text-lg font-medium px-3 py-2 rounded-lg focus:bg-white/10 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              className="btn-primary text-lg font-semibold shadow-md hover:shadow-blue-500/30 focus:shadow-blue-500/40 px-7 py-2.5 ml-2"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Start a new project"
            >
              Start Project
            </motion.a>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white hover:text-blue-400 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-7 w-7" aria-hidden="true" /> : <Menu className="h-7 w-7" aria-hidden="true" />}
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
        <div className="bg-black/95 backdrop-blur-lg border-t border-white/10 rounded-b-2xl shadow-xl">
          <ul className="px-4 pt-4 pb-6 space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="block text-white/90 hover:text-blue-400 focus:text-blue-400 transition-all duration-200 text-lg font-medium py-3 px-4 rounded-lg hover:bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                className="block w-full text-center btn-primary text-lg font-semibold px-7 py-3 mt-2 shadow-md hover:shadow-blue-500/30 focus:shadow-blue-500/40"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Start a new project"
              >
                Start Project
              </a>
            </li>
          </ul>
        </div>
      </motion.nav>
    </header>
  );
} 