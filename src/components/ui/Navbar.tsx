"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Bot, CreditCard, User } from "lucide-react"
import { GlowButton } from "./GlowButton"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav 
      className={`nav-glass sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-black/20' : ''
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-neon"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Bot className="h-6 w-6 text-black" />
            </motion.div>
            <span className="text-xl font-bold text-glow">Xeinst</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {[
                { href: "/marketplace", label: "Marketplace" },
                { href: "/upload", label: "Upload Agent" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/pricing", label: "Pricing" }
              ].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-white hover:text-cyan-400 transition-colors duration-200 font-medium relative group"
                  >
                    {link.label}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"
                      whileHover={{ width: "100%" }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Auth */}
          <motion.div 
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <motion.div 
              className="flex items-center space-x-2 text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">1,250 Credits</span>
            </motion.div>
            <GlowButton variant="glass" size="sm">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </GlowButton>
          </motion.div>

          {/* Mobile menu button */}
          <motion.div 
            className="md:hidden"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-cyan-400 transition-colors duration-200"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden glass-panel mx-4 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="px-2 pt-2 pb-3 space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {[
                { href: "/marketplace", label: "Marketplace" },
                { href: "/upload", label: "Upload Agent" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/pricing", label: "Pricing" }
              ].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    className="block px-3 py-2 text-white hover:text-cyan-400 transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                className="pt-4 border-t border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center space-x-2 text-white">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm font-medium">1,250 Credits</span>
                  </div>
                  <GlowButton variant="glass" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </GlowButton>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}