"use client"
import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
  const footerLinks = [
    { name: "About", href: "/about" },
    { name: "Terms", href: "/legal/terms" },
    { name: "Privacy", href: "/legal/privacy" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true }}
      className="border-t border-glass bg-black/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-glow">
              Xeinst
            </div>
          </Link>

          {/* Links */}
          <div className="flex items-center space-x-6">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/70 hover:text-accent transition-colors duration-200 text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-white/50 text-sm">
            © 2024 Xeinst. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
