"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { PageHeader } from "../../design-system/components/PageHeader";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Clock,
  Users,
  CheckCircle
} from "lucide-react";
// Removed duplicate import - already imported above

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      value: "hello@xeinst.com",
      action: "mailto:hello@xeinst.com"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      value: "Available 24/7",
      action: "#"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our team",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    }
  ];

  const supportHours = [
    {
      day: "Monday - Friday",
      hours: "9:00 AM - 6:00 PM PST"
    },
    {
      day: "Saturday",
      hours: "10:00 AM - 4:00 PM PST"
    },
    {
      day: "Sunday",
      hours: "Closed"
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-500/20 mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-glow mb-4">Message Sent!</h1>
            <p className="text-white/70 mb-6">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Get in Touch"
        subtitle="Have questions about our AI agent marketplace? We're here to help you succeed."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-glow-sm mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    name="name"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    name="email"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company (Optional)"
                    type="text"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={handleInputChange}
                    name="company"
                  />
                  <Input
                    label="Subject"
                    type="text"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleInputChange}
                    name="subject"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Message</label>
                  <textarea
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleInputChange}
                    name="message"
                    required
                    rows={6}
                    className="w-full px-3 py-2 rounded-xl border border-glass bg-white/5 text-white placeholder:text-white/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Methods */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-glow-sm">Contact Information</h2>
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 flex-shrink-0">
                        <info.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{info.title}</h3>
                        <p className="text-white/70 text-sm mb-2">{info.description}</p>
                        <a
                          href={info.action}
                          className="text-accent hover:text-accent/80 transition-colors font-medium"
                        >
                          {info.value}
                        </a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Support Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                  <h3 className="text-lg font-semibold text-white">Support Hours</h3>
                </div>
                <div className="space-y-2">
                  {supportHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-white/70">{schedule.day}</span>
                      <span className="text-white font-medium">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a
                    href="/pricing"
                    className="flex items-center justify-between text-white/70 hover:text-accent transition-colors"
                  >
                    <span>Pricing Plans</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/marketplace"
                    className="flex items-center justify-between text-white/70 hover:text-accent transition-colors"
                  >
                    <span>Browse Agents</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/upload"
                    className="flex items-center justify-between text-white/70 hover:text-accent transition-colors"
                  >
                    <span>Upload Agent</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/legal/terms"
                    className="flex items-center justify-between text-white/70 hover:text-accent transition-colors"
                  >
                    <span>Terms of Service</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}