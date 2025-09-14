"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bot, CreditCard, User, Search, Bell, ChevronDown } from "lucide-react"
import { MobileNav } from "./MobileNav"
import { GlowButton } from "./GlowButton"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when path changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: Search },
    { href: "/upload", label: "Upload Agent", icon: Bot },
    { href: "/dashboard", label: "Dashboard", icon: CreditCard },
    { href: "/pricing", label: "Pricing", icon: ChevronDown }
  ]

  return (
    <motion.nav 
      className={`nav-glass sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-black/30 shadow-lg shadow-cyan-500/5' : ''
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-neon shadow-lg shadow-cyan-500/20"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Bot className="h-6 w-6 text-black" />
              </motion.div>
              <span className="text-xl font-bold text-glow">Xeinst</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium relative group
                      ${isActive(link.href) 
                        ? 'text-cyan-400 bg-white/5' 
                        : 'text-white hover:text-cyan-400 hover:bg-white/5'}`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {isActive(link.href) && (
                      <motion.div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"
                        layoutId="activeNavIndicator"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
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
            {/* Search button */}
            <motion.button
              className="p-2 text-white/70 hover:text-cyan-400 rounded-full hover:bg-white/5 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-5 w-5" />
            </motion.button>
            
            {/* Notifications */}
            <motion.button
              className="p-2 text-white/70 hover:text-cyan-400 rounded-full hover:bg-white/5 transition-colors duration-200 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </motion.button>
            
            {/* Credits */}
            <motion.div 
              className="flex items-center space-x-2 text-white bg-white/5 px-3 py-1.5 rounded-full"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <CreditCard className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">1,250 Credits</span>
            </motion.div>
            
            {/* Sign In Button */}
            <GlowButton variant="neon" size="sm">
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
              className="p-2 text-white hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
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

      {/* Search bar - conditionally shown */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="border-t border-white/10 bg-black/30 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search agents, tools, categories..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-200"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </motion.nav>
  )
}