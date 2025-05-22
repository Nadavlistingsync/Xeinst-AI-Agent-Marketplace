'use client';

// Triggering new deployment
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MessageSquare, 
  Target, 
  CheckCircle2,
  Clock,
  Star,
  Building2,
  Bot,
  Store
} from 'lucide-react';
import Header from '@/components/Header';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 glass-section">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-black/80 to-purple-900/60 animate-gradient-move" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="container text-center relative z-10"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="text-7xl md:text-9xl font-extrabold mb-6 logo-glow tracking-widest gradient-text-accent drop-shadow-lg"
            >
              Xeinst
            </motion.h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
              Building the future of AI, one innovation at a time
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a href="#contact" className="btn-primary text-lg px-10 py-5">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Products Section */}
        <section id="products" className="section-padding glass-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 glow-text gradient-text-accent drop-shadow">
                Our Products
              </h2>
              <p className="text-2xl text-white/80 max-w-2xl mx-auto">
                Choose the perfect AI solution for your needs
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8"
            >
              {[
                {
                  icon: <Bot className="h-12 w-12 text-blue-400" />,
                  title: "Custom AI Agents",
                  description: "Tailored AI solutions built specifically for your business needs",
                  cta: "Get Started",
                  link: "#contact"
                },
                {
                  icon: <Store className="h-12 w-12 text-blue-400" />,
                  title: "AI Agents Marketplace",
                  description: "Browse and deploy ready-made AI agents for instant automation",
                  cta: "Explore Marketplace",
                  link: "/marketplace"
                }
              ].map((product, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="p-8 rounded-xl glass-card glow-border card-hover"
                >
                  <div className="mb-6">{product.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4 glow-text">{product.title}</h3>
                  <p className="text-white/80 mb-6">{product.description}</p>
                  <motion.a
                    href={product.link}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    {product.cta}
                  </motion.a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <div className="section-divider" />

        {/* How It Works */}
        <section id="how-it-works" className="section-padding glass-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                How It Works
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Our process is designed to deliver exceptional results with minimal friction
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <MessageSquare className="h-12 w-12 text-blue-400" />,
                  title: "Discovery",
                  description: "We start by understanding your vision and requirements"
                },
                {
                  icon: <Target className="h-12 w-12 text-blue-400" />,
                  title: "Development",
                  description: "Our team builds your AI solution with cutting-edge technology"
                },
                {
                  icon: <CheckCircle2 className="h-12 w-12 text-blue-400" />,
                  title: "Delivery",
                  description: "We deliver a polished product that exceeds expectations"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="p-8 rounded-xl glass-card glow-border card-hover"
                >
                  <div className="mb-6">{step.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4 glow-text">{step.title}</h3>
                  <p className="text-white/80">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <div className="section-divider" />

        {/* Benefits */}
        <section id="benefits" className="section-padding glass-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                Why Choose Xeinst
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                We combine cutting-edge technology with exceptional service
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <Star className="h-8 w-8 text-blue-400" />,
                  title: "Expert Team",
                  description: "Our team consists of AI specialists with years of experience"
                },
                {
                  icon: <Clock className="h-8 w-8 text-blue-400" />,
                  title: "Fast Delivery",
                  description: "We deliver results quickly without compromising quality"
                },
                {
                  icon: <Building2 className="h-8 w-8 text-blue-400" />,
                  title: "Enterprise Ready",
                  description: "Solutions built to scale with your business"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="p-6 rounded-xl glass-card glow-border card-hover"
                >
                  <div className="flex items-center mb-4">
                    <div className="mr-4">{benefit.icon}</div>
                    <h3 className="text-xl font-semibold glow-text">{benefit.title}</h3>
                  </div>
                  <p className="text-white/80">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="section-padding glass-section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                Start Your Project
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Let&apos;s build something amazing together
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Message
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Tell us about your project..."
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
