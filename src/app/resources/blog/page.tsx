"use client";

import { Button } from "../../../components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  ArrowRight,
  Calendar,
  User,
  Clock,
  Search,
  Tag,
  MessageSquare,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";
import { useState } from "react";

const blogPosts = [
  {
    title: "Deterministic AI Outputs with JSON Schema",
    excerpt: "Learn how to ensure your AI agents always return structured, predictable responses using JSON Schema validation.",
    author: "Sarah Chen",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Technical",
    tags: ["JSON Schema", "AI Agents", "Validation"],
    featured: true,
    image: "/api/placeholder/600/300"
  },
  {
    title: "Make.com + Xeinst: When to Use Scenarios vs Agents",
    excerpt: "A comprehensive guide to choosing between Make.com scenarios and Xeinst agents for different automation needs.",
    author: "Marcus Johnson",
    date: "2024-01-12",
    readTime: "12 min read",
    category: "Integration",
    tags: ["Make.com", "Automation", "Integration"],
    featured: true,
    image: "/api/placeholder/600/300"
  },
  {
    title: "Guardrails that Actually Prevent Incidents",
    excerpt: "Real-world examples of AI guardrails that prevent costly mistakes and ensure reliable agent behavior.",
    author: "Emily Watson",
    date: "2024-01-10",
    readTime: "10 min read",
    category: "Security",
    tags: ["Guardrails", "Security", "Best Practices"],
    featured: false,
    image: "/api/placeholder/600/300"
  },
  {
    title: "Tracing LLM Pipelines: From Mystery to Metrics",
    excerpt: "How to implement comprehensive observability for your AI agent pipelines and debug issues effectively.",
    author: "Alex Rodriguez",
    date: "2024-01-08",
    readTime: "15 min read",
    category: "Observability",
    tags: ["Observability", "Debugging", "Monitoring"],
    featured: false,
    image: "/api/placeholder/600/300"
  },
  {
    title: "Building a Support Triage Agent that Doesn't Hallucinate",
    excerpt: "Step-by-step guide to building a reliable customer support agent with proper validation and fallback mechanisms.",
    author: "David Kim",
    date: "2024-01-05",
    readTime: "18 min read",
    category: "Use Cases",
    tags: ["Customer Support", "AI Agents", "Tutorial"],
    featured: false,
    image: "/api/placeholder/600/300"
  },
  {
    title: "Evaluating Prompts at Scale with Eval Sets",
    excerpt: "Learn how to systematically test and improve your AI agent prompts using evaluation sets and A/B testing.",
    author: "Lisa Wang",
    date: "2024-01-03",
    readTime: "14 min read",
    category: "Technical",
    tags: ["Evaluation", "Prompts", "Testing"],
    featured: false,
    image: "/api/placeholder/600/300"
  }
];

const categories = [
  { name: "All", count: 24, active: true },
  { name: "Technical", count: 8, active: false },
  { name: "Integration", count: 6, active: false },
  { name: "Security", count: 4, active: false },
  { name: "Use Cases", count: 6, active: false }
];

const featuredPost = blogPosts.find(post => post.featured);

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              Blog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Insights, tutorials, and best practices for building production-ready AI agents.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-md mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-ai-primary/20 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ai-primary focus:border-transparent"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-20 bg-gradient-to-b from-background to-background/50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-ai-primary/20 bg-gradient-to-r from-ai-primary/5 to-ai-secondary/5">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge className="bg-gradient-ai text-white border-0">
                      Featured
                    </Badge>
                    <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                      {featuredPost.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl text-white mb-4">{featuredPost.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-lg">
                    {featuredPost.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    <Button className="bg-gradient-ai hover:bg-gradient-ai/90">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-10 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-2 justify-center"
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
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40 cursor-pointer">
                  <div className="aspect-video bg-gradient-to-r from-ai-primary/20 to-ai-secondary/20 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                        {post.category}
                      </Badge>
                      {post.featured && (
                        <Badge className="bg-gradient-ai text-white border-0">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl text-white line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs bg-ai-primary/10 text-ai-primary border-ai-primary/20">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Button variant="ghost" className="text-ai-primary hover:text-white">
                          Read More
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get the latest articles, tutorials, and product updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-background/50 border border-ai-primary/20 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ai-primary focus:border-transparent"
                />
                <Button className="bg-gradient-ai hover:bg-gradient-ai/90">
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
