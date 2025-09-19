"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Bot, 
  CreditCard, 
  User, 
  Search, 
  Home, 
  Upload, 
  Settings, 
  HelpCircle, 
  Bell, 
  X
} from "lucide-react"
import { Button } from "."

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(3)

  // Close mobile menu when path changes
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: Search },
    { href: "/upload", label: "Upload Agent", icon: Upload },
    { href: "/dashboard", label: "Dashboard", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help & Support", icon: HelpCircle }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Side drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-gradient-to-b from-gray-900 to-black border-l border-white/10 z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center">
                    <Bot className="h-6 w-6 text-black" />
                  </div>
                  <span className="text-xl font-bold text-glow">Xeinst</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-white/70 hover:text-cyan-400 rounded-full hover:bg-white/5"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* User info */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Guest User</div>
                    <div className="text-white/60 text-sm">Sign in to access all features</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="neon" fullWidth>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive(link.href) 
                        ? 'text-cyan-400 bg-white/5 border-l-2 border-cyan-400 pl-3' 
                        : 'text-white hover:text-cyan-400 hover:bg-white/5'}`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                    {link.label === "Dashboard" && notifications > 0 && (
                      <span className="ml-auto bg-cyan-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              
              {/* Credits */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-cyan-400" />
                    <span className="text-white font-medium">Credits</span>
                  </div>
                  <div className="text-cyan-400 font-bold">1,250</div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 text-center text-white/40 text-sm">
                <p>© 2024 Xeinst. All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
