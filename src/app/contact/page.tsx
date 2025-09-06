"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Users
} from "lucide-react";

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
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      description: "Get in touch via email",
      value: "hello@xeinst.com",
      href: "mailto:hello@xeinst.com"
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us directly",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: MapPin,
      title: "Office",
      description: "Visit our headquarters",
      value: "San Francisco, CA",
      href: "#"
    }
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our support team",
      response: "Usually responds in minutes",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      response: "Usually responds within 24 hours",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Users,
      title: "Enterprise Sales",
      description: "Speak with our sales team",
      response: "Schedule a call within 1 business day",
      color: "from-purple-500 to-pink-500"
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container">
          <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Message Sent!</h1>
              <p className="text-muted-foreground mb-8">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <Button onClick={() => setSubmitted(false)}>
                Send Another Message
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-dark">
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 mb-6">
              <Badge className="bg-ai-primary/20 text-ai-primary border-ai-primary/30 px-4 py-2 text-sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Us
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-animate">Get in Touch</span>
              <br />
              <span className="text-white">With Our Team</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have questions about our AI agents or need help with your implementation? 
              We're here to help you succeed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mx-auto mb-4">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{info.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {info.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <a 
                      href={info.href}
                      className="text-ai-primary hover:text-ai-primary/80 transition-colors duration-300 font-medium"
                    >
                      {info.value}
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              How Can We Help?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Choose the best way to get the support you need
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {supportOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{option.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{option.response}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-ai-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Send us a Message</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium text-white">
                            Full Name *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-muted/50 border-border text-white placeholder:text-muted-foreground"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-white">
                            Email Address *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-muted/50 border-border text-white placeholder:text-muted-foreground"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium text-white">
                          Company
                        </label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="bg-muted/50 border-border text-white placeholder:text-muted-foreground"
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-white">
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="bg-muted/50 border-border text-white placeholder:text-muted-foreground"
                          placeholder="What's this about?"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-white">
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange}
                          className="bg-muted/50 border-border text-white placeholder:text-muted-foreground"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-ai hover:bg-gradient-ai/90"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Send Message
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Why Choose XEINST?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Expert AI Solutions</h4>
                        <p className="text-muted-foreground text-sm">
                          Our team specializes in AI agent development and deployment.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">24/7 Support</h4>
                        <p className="text-muted-foreground text-sm">
                          Get help whenever you need it with our round-the-clock support.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Custom Solutions</h4>
                        <p className="text-muted-foreground text-sm">
                          We build custom AI solutions tailored to your specific needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Business Hours</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                    <p>Saturday: 10:00 AM - 4:00 PM PST</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Emergency Support</h3>
                  <p className="text-muted-foreground mb-4">
                    For urgent issues outside business hours, please email us at:
                  </p>
                  <a 
                    href="mailto:emergency@xeinst.com"
                    className="text-ai-primary hover:text-ai-primary/80 transition-colors duration-300 font-medium"
                  >
                    emergency@xeinst.com
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
