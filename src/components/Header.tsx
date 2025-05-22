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

  const headerVariants = {
    top: {
      backgroundColor: 'rgba(20, 24, 40, 0.55)',
      backdropFilter: 'blur(16px)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      boxShadow: '0 4px 32px 0 rgba(31, 38, 135, 0.10)',
    },
    scrolled: {
      backgroundColor: 'rgba(18, 20, 38, 0.92)',
      backdropFilter: 'blur(20px)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
    }
  };

  return (
    <motion.header
      className="fixed w-full z-50 border-b transition-all duration-300"
      initial="top"
      animate={scrolled ? "scrolled" : "top"}
      variants={headerVariants}
      transition={{ duration: 0.4 }}
      role="banner"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold tracking-[0.2em] logo-glow drop-shadow-xl"
            aria-label="Xeinst Home"
          >
            Xeinst
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            {menuItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-white/90 hover:text-white transition-colors duration-200 text-sm tracking-wider font-light px-2 py-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              className="btn-primary text-sm px-6 py-2 tracking-wider ml-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start a new project"
            >
              Start Project
            </motion.a>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white hover:text-white/90 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav
        id="mobile-menu"
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-black/95 backdrop-blur-lg border-b border-white/10`}
        aria-label="Mobile navigation"
        role="navigation"
      >
        <ul className="px-4 pt-4 pb-6 space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="block text-white/90 hover:text-white transition-colors duration-200 text-base font-light py-3 px-2 rounded"
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
              className="btn-primary w-full block text-center mt-2"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Start a new project"
            >
              Start Project
            </a>
          </li>
        </ul>
      </nav>
    </motion.header>
  );
} 