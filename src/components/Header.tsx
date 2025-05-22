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
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(8px)',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    scrolled: {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(255, 255, 255, 0.1)'
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
            className="text-2xl font-light tracking-[0.2em] logo-glow"
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
                className="text-white/90 hover:text-white transition-colors duration-200 text-sm tracking-wider font-light"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              className="btn-primary text-sm px-6 py-2 tracking-wider"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Start a new project"
            >
              Start Project
            </motion.a>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white hover:text-white/90"
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
      <motion.nav
        id="mobile-menu"
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block px-3 py-2 text-white/90 hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="block px-3 py-2 text-white/90 hover:text-white transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Start a new project"
          >
            Start Project
          </a>
        </div>
      </motion.nav>
    </motion.header>
  );
} 