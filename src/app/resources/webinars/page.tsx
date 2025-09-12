"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Play, 
  Calendar,
  Clock,
  Users,
  ArrowRight,
  ExternalLink,
  Download,
  Star,
  CheckCircle,
  Zap,
  Building,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const upcomingWebinars = [
  {
    title: "Building Production-Ready AI Agents: From Prototype to Scale",
    date: "2024-01-15",
    time: "2:00 PM EST",
    duration: "45 minutes",
    speaker: "Sarah Chen, CTO at Xeinst",
    description: "Learn how to build, deploy, and scale AI agents that your operations team can trust. We'll cover best practices for agent architecture, monitoring, and governance.",
    topics: [
      "Agent architecture patterns",
      "Deployment strategies",
      "Monitoring and observability",
      "Governance and compliance"
    ],
    attendees: 1250,
    featured: true,
    category: "Technical Deep Dive"
  },
  {
    title: "AI Agent Security: Protecting Your Business from Day One",
    date: "2024-01-22",
    time: "1:00 PM EST",
    duration: "30 minutes",
    speaker: "Michael Rodriguez, Security Lead",
    description: "Essential security practices for AI agents in enterprise environments. Learn about guardrails, audit trails, and compliance requirements.",
    topics: [
      "Security guardrails",
      "Audit and compliance",
      "Data protection",
      "Access controls"
    ],
    attendees: 890,
    featured: false,
    category: "Security"
  },
  {
    title: "Customer Support Automation: Real-World Case Studies",
    date: "2024-01-29",
    time: "3:00 PM EST",
    duration: "40 minutes",
    speaker: "Lisa Park, Customer Success Manager",
    description: "See how leading companies are using AI agents to transform their customer support operations and improve satisfaction scores.",
    topics: [
      "Support automation strategies",
      "Quality assurance",
      "Customer satisfaction metrics",
      "ROI measurement"
    ],
    attendees: 1100,
    featured: false,
    category: "Use Cases"
  }
];

const pastWebinars = [
  {
    title: "Getting Started with Xeinst: Your First AI Agent in 30 Minutes",
    date: "2024-01-08",
    duration: "35 minutes",
    speaker: "Alex Thompson, Developer Advocate",
    description: "A hands-on walkthrough of building your first AI agent using Xeinst's visual builder and deployment tools.",
    recordingUrl: "#",
    slidesUrl: "#",
    attendees: 2100,
    rating: 4.8,
    category: "Getting Started"
  },
  {
    title: "Enterprise AI Agent Deployment: Lessons from the Field",
    date: "2024-01-01",
    duration: "50 minutes",
    speaker: "Dr. Emily Watson, Enterprise Solutions Architect",
    description: "Real-world insights from deploying AI agents at scale in enterprise environments, including challenges and solutions.",
    recordingUrl: "#",
    slidesUrl: "#",
    attendees: 1800,
    rating: 4.9,
    category: "Enterprise"
  },
  {
    title: "AI Agent Monitoring and Observability Best Practices",
    date: "2023-12-25",
    duration: "42 minutes",
    speaker: "James Liu, Head of Engineering",
    description: "Learn how to monitor, debug, and optimize your AI agents for maximum performance and reliability.",
    recordingUrl: "#",
    slidesUrl: "#",
    attendees: 1650,
    rating: 4.7,
    category: "Technical Deep Dive"
  },
  {
    title: "Building Compliant AI Agents for Healthcare and Finance",
    date: "2023-12-18",
    duration: "38 minutes",
    speaker: "Dr. Maria Santos, Compliance Officer",
    description: "Navigate the complex world of AI compliance in regulated industries with practical examples and frameworks.",
    recordingUrl: "#",
    slidesUrl: "#",
    attendees: 1400,
    rating: 4.8,
    category: "Compliance"
  }
];

const categories = [
  { name: "All", count: 12, active: true },
  { name: "Getting Started", count: 3, active: false },
  { name: "Technical Deep Dive", count: 3, active: false },
  { name: "Enterprise", count: 2, active: false },
  { name: "Security", count: 2, active: false },
  { name: "Use Cases", count: 2, active: false }
];

export default function WebinarsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPastWebinars, setShowPastWebinars] = useState(false);

  const filteredUpcoming = upcomingWebinars.filter(webinar => 
    selectedCategory === "All" || webinar.category === selectedCategory
  );

  const filteredPast = pastWebinars.filter(webinar => 
    selectedCategory === "All" || webinar.category === selectedCategory
  );

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
              Webinars & Events
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Learn from experts and discover how to build, deploy, and scale AI agents that transform your business operations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Calendar className="w-5 h-5 mr-2" />
                View Calendar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Download className="w-5 h-5 mr-2" />
                Download All Recordings
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-10 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-2 justify-center mb-6"
          >
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-ai-primary text-white'
                    : 'bg-background/50 text-muted-foreground hover:text-white hover:bg-ai-primary/20'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </motion.div>
          
          <div className="flex justify-center">
            <div className="flex bg-background/50 rounded-lg p-1">
              <button
                onClick={() => setShowPastWebinars(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showPastWebinars
                    ? 'bg-ai-primary text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Upcoming Webinars
              </button>
              <button
                onClick={() => setShowPastWebinars(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showPastWebinars
                    ? 'bg-ai-primary text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Past Webinars
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Webinars */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="space-y-8">
            {!showPastWebinars ? (
              // Upcoming Webinars
              <>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-white mb-8"
                >
                  Upcoming Webinars
                </motion.h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredUpcoming.map((webinar, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className={`border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300 ${
                        webinar.featured ? 'bg-gradient-to-r from-ai-primary/5 to-ai-secondary/5' : ''
                      }`}>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4">
                            {webinar.featured && (
                              <Badge className="bg-gradient-ai text-white border-0">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                              {webinar.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl text-white mb-2">{webinar.title}</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {webinar.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(webinar.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{webinar.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{webinar.attendees} registered</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Building className="w-4 h-4" />
                              <span>{webinar.speaker}</span>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">Topics Covered:</h4>
                              <ul className="space-y-1">
                                {webinar.topics.map((topic, topicIndex) => (
                                  <li key={topicIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex space-x-2">
                              <Button className="flex-1 bg-gradient-ai hover:bg-gradient-ai/90">
                                <Calendar className="w-4 h-4 mr-2" />
                                Register Now
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                              <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              // Past Webinars
              <>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-white mb-8"
                >
                  Past Webinars
                </motion.h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredPast.map((webinar, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                              {webinar.category}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{webinar.rating}</span>
                            </div>
                          </div>
                          <CardTitle className="text-xl text-white mb-2">{webinar.title}</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {webinar.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(webinar.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{webinar.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{webinar.attendees} attended</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Building className="w-4 h-4" />
                              <span>{webinar.speaker}</span>
                            </div>

                            <div className="flex space-x-2">
                              <Button className="flex-1 bg-gradient-ai hover:bg-gradient-ai/90">
                                <Play className="w-4 h-4 mr-2" />
                                Watch Recording
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                              <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Never Miss a Webinar
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Get notified about upcoming webinars, new recordings, and exclusive content from our experts.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Subscribe to Updates
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Calendar className="w-5 h-5 mr-2" />
                Add to Calendar
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
