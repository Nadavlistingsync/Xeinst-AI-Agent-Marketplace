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
          >
            Xeinst
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-white/90 hover:text-white transition-colors duration-200 text-sm tracking-wider font-light"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              className="btn-primary text-sm px-6 py-2 tracking-wider"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
          >
            {isMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.nav
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : -20 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="px-4 pt-2 pb-4 space-y-2"
          animate={scrolled ? {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(12px)'
          } : {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)'
          }}
          transition={{ duration: 0.4 }}
        >
          {menuItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="block py-2 text-sm tracking-wider font-light text-white/90 hover:text-white"
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </motion.a>
          ))}
          <motion.a
            href="#contact"
            className="block btn-primary text-sm text-center py-2 mt-4 tracking-wider"
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsMenuOpen(false)}
          >
            Start Project
          </motion.a>
        </motion.div>
      </motion.nav>
    </motion.header>
  );
} 