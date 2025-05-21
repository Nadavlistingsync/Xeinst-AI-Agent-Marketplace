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
  Building2
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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-black" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="container text-center relative z-10"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-7xl md:text-9xl font-light mb-6 logo-glow tracking-widest"
            >
              Xeinst
            </motion.h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Building the future of AI, one innovation at a time
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a href="#contact" className="btn-primary">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="section-padding bg-black/50">
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
                  className="p-8 rounded-xl bg-black/50 glow-border card-hover"
                >
                  <div className="mb-6">{step.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4 glow-text">{step.title}</h3>
                  <p className="text-white/80">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Marketplace Section */}
        <section className="section-padding bg-black/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI Agents Marketplace
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Browse ready-made AI agents built from real client requests — automate your workflow in seconds.
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
                  name: "Real Estate Assistant",
                  description: "Automate property research and client communication",
                  tag: "Real Estate",
                  rating: 4.8
                },
                {
                  name: "Fitness Coach",
                  description: "Personalized workout plans and nutrition tracking",
                  tag: "Gym",
                  rating: 4.9
                },
                {
                  name: "E-commerce Optimizer",
                  description: "Product recommendations and inventory management",
                  tag: "Ecommerce",
                  rating: 4.7
                }
              ].map((agent, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="p-6 rounded-xl bg-black/50 glow-border card-hover"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                      {agent.tag}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-white/80">{agent.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 glow-text">{agent.name}</h3>
                  <p className="text-white/80 mb-4">{agent.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    View Agent
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-blue-400 border-2 border-blue-400 py-3 px-8 rounded-lg hover:bg-blue-400/10 transition-colors duration-300"
              >
                Explore All Agents
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-padding bg-black/30">
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
                  className="p-6 rounded-xl bg-black/50 glow-border card-hover"
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
        <section id="contact" className="section-padding bg-black/50">
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
