"use client";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { 
  Mail, 
  MessageSquare, 
  MapPin,
  Phone,
  Send,
  Clock,
  Users,
  Building,
  Shield,
  Code,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help with your account and technical questions",
    contact: "support@xeinst.com",
    response: "Within 24 hours"
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    contact: "Available 24/7",
    response: "Immediate"
  },
  {
    icon: Building,
    title: "Sales Inquiries",
    description: "Speak with our sales team about enterprise solutions",
    contact: "sales@xeinst.com",
    response: "Within 4 hours"
  },
  {
    icon: Shield,
    title: "Security Reports",
    description: "Report security vulnerabilities or concerns",
    contact: "security@xeinst.com",
    response: "Within 2 hours"
  }
];

const departments = [
  {
    icon: Users,
    title: "General Support",
    description: "Account questions, billing, and general inquiries",
    email: "support@xeinst.com"
  },
  {
    icon: Building,
    title: "Sales & Partnerships",
    description: "Enterprise sales, partnerships, and business development",
    email: "sales@xeinst.com"
  },
  {
    icon: Code,
    title: "Developer Relations",
    description: "API support, SDK questions, and developer resources",
    email: "dev@xeinst.com"
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Security reports, compliance questions, and audits",
    email: "security@xeinst.com"
  },
  {
    icon: Globe,
    title: "Press & Media",
    description: "Media inquiries, press releases, and partnerships",
    email: "press@xeinst.com"
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    department: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit form data to API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
        department: "general"
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-gradient mb-6"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Get in touch with our team. We're here to help you succeed with AI agents.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Get in Touch
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Choose the best way to reach us
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mx-auto mb-4">
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                    <p className="text-sm text-ai-primary font-semibold mb-2">{method.contact}</p>
                    <p className="text-xs text-muted-foreground">{method.response}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Name *</label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="bg-background/50 border-ai-primary/20 text-white placeholder:text-muted-foreground"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Email *</label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="bg-background/50 border-ai-primary/20 text-white placeholder:text-muted-foreground"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Company</label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="bg-background/50 border-ai-primary/20 text-white placeholder:text-muted-foreground"
                          placeholder="Your company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-background/50 border border-ai-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-ai-primary focus:border-transparent"
                        >
                          <option value="general">General Support</option>
                          <option value="sales">Sales & Partnerships</option>
                          <option value="dev">Developer Relations</option>
                          <option value="security">Security & Compliance</option>
                          <option value="press">Press & Media</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Subject *</label>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="bg-background/50 border-ai-primary/20 text-white placeholder:text-muted-foreground"
                          placeholder="What's this about?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Message *</label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="bg-background/50 border-ai-primary/20 text-white placeholder:text-muted-foreground"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-ai hover:bg-gradient-ai/90"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                        <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <Card className="border-ai-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Office Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-ai-primary" />
                      <div>
                        <p className="text-white font-medium">Headquarters</p>
                        <p className="text-muted-foreground">San Francisco, CA</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-ai-primary" />
                      <div>
                        <p className="text-white font-medium">Business Hours</p>
                        <p className="text-muted-foreground">Monday - Friday, 9 AM - 6 PM PST</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-ai-primary" />
                      <div>
                        <p className="text-white font-medium">Phone</p>
                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-ai-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Departments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departments.map((dept, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <dept.icon className="w-5 h-5 text-ai-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-white font-medium">{dept.title}</p>
                            <p className="text-sm text-muted-foreground">{dept.description}</p>
                            <p className="text-sm text-ai-primary">{dept.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
