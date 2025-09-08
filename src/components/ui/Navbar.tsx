"use client"
import { useState } from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { Menu, X, User, CreditCard } from "lucide-react"
import { GlowButton } from "./GlowButton"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const navItems = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Upload Agent", href: "/upload" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pricing", href: "/pricing" },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-glass bg-black/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-glow"
            >
              Xeinst
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-accent transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side - Auth & Credits */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <span className="text-white">Credits: 0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-white">{session.user?.name || session.user?.email}</span>
                </div>
                <GlowButton
                  variant="secondary"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Sign Out
                </GlowButton>
              </>
            ) : (
              <GlowButton
                variant="primary"
                size="sm"
                onClick={() => signIn()}
              >
                Sign In
              </GlowButton>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-glass"
          >
            <div className="py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-white hover:text-accent transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-glass">
                {session ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <CreditCard className="h-4 w-4 text-accent" />
                      <span className="text-white">Credits: 0</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-white" />
                      <span className="text-white">{session.user?.name || session.user?.email}</span>
                    </div>
                    <GlowButton
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </GlowButton>
                  </div>
                ) : (
                  <GlowButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => signIn()}
                  >
                    Sign In
                  </GlowButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
