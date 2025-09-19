"use client";

import { useState } from "react";
import { Button } from "../../../components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  FileText, 
  Play, 
  ArrowRight,
  Download,
  ExternalLink,
  Users,
  Clock,
  CheckCircle,
  Star,
  Building,
  Globe,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const caseStudies = [
  {
    title: "TechFlow Solutions: 75% Reduction in Support Response Time",
    company: "TechFlow Solutions",
    industry: "SaaS",
    companySize: "500-1000 employees",
    challenge: "High ticket volume with slow response times and inconsistent quality",
    solution: "Implemented Xeinst customer support agents for auto-triage and response generation",
    results: [
      "75% reduction in first response time",
      "40% increase in resolution rate",
      "90% customer satisfaction score",
      "60% reduction in agent workload"
    ],
    metrics: {
      responseTime: "75% faster",
      satisfaction: "90%",
      resolution: "+40%",
      workload: "-60%"
    },
    featured: true,
    readTime: "8 min read",
    category: "Customer Support"
  },
  {
    title: "GlobalCorp: AI-Powered Lead Processing at Scale",
    company: "GlobalCorp",
    industry: "Enterprise Software",
    companySize: "1000+ employees",
    challenge: "Manual lead processing was slow and error-prone, missing opportunities",
    solution: "Deployed Xeinst agents for automated lead enrichment and qualification",
    results: [
      "300% increase in lead processing speed",
      "85% improvement in lead quality scores",
      "50% reduction in manual data entry",
      "25% increase in conversion rates"
    ],
    metrics: {
      processingSpeed: "300% faster",
      quality: "+85%",
      manualWork: "-50%",
      conversion: "+25%"
    },
    featured: true,
    readTime: "10 min read",
    category: "Sales & Marketing"
  },
  {
    title: "HealthTech Innovations: HIPAA-Compliant Patient Communication",
    company: "HealthTech Innovations",
    industry: "Healthcare",
    companySize: "100-500 employees",
    challenge: "Need for automated patient communication while maintaining HIPAA compliance",
    solution: "Implemented Xeinst agents with HIPAA-compliant guardrails and audit logging",
    results: [
      "99.9% HIPAA compliance rate",
      "80% reduction in manual patient outreach",
      "95% patient satisfaction with automated responses",
      "50% faster appointment scheduling"
    ],
    metrics: {
      compliance: "99.9%",
      automation: "80%",
      satisfaction: "95%",
      scheduling: "50% faster"
    },
    featured: false,
    readTime: "12 min read",
    category: "Healthcare"
  },
  {
    title: "EduTech Academy: Personalized Learning Assistant",
    company: "EduTech Academy",
    industry: "Education",
    companySize: "500-1000 employees",
    challenge: "Providing personalized learning support to thousands of students",
    solution: "Deployed Xeinst agents as personalized learning assistants with FERPA compliance",
    results: [
      "90% student engagement improvement",
      "60% reduction in instructor workload",
      "85% improvement in learning outcomes",
      "24/7 student support availability"
    ],
    metrics: {
      engagement: "+90%",
      workload: "-60%",
      outcomes: "+85%",
      availability: "24/7"
    },
    featured: false,
    readTime: "9 min read",
    category: "Education"
  },
  {
    title: "FinTech Secure: Automated Compliance Monitoring",
    company: "FinTech Secure",
    industry: "Financial Services",
    companySize: "100-500 employees",
    challenge: "Manual compliance monitoring was expensive and error-prone",
    solution: "Implemented Xeinst agents for automated compliance checking and reporting",
    results: [
      "95% reduction in compliance errors",
      "70% faster compliance reporting",
      "80% cost reduction in compliance operations",
      "100% audit trail coverage"
    ],
    metrics: {
      errors: "-95%",
      reporting: "70% faster",
      costs: "-80%",
      coverage: "100%"
    },
    featured: false,
    readTime: "11 min read",
    category: "Financial Services"
  },
  {
    title: "RetailMax: Intelligent Inventory Management",
    company: "RetailMax",
    industry: "Retail",
    companySize: "1000+ employees",
    challenge: "Inventory management across multiple locations was inefficient",
    solution: "Deployed Xeinst agents for intelligent inventory forecasting and management",
    results: [
      "40% reduction in stockouts",
      "30% improvement in inventory turnover",
      "25% reduction in carrying costs",
      "90% accuracy in demand forecasting"
    ],
    metrics: {
      stockouts: "-40%",
      turnover: "+30%",
      costs: "-25%",
      accuracy: "90%"
    },
    featured: false,
    readTime: "7 min read",
    category: "Retail"
  }
];

const industries = [
  { name: "All", count: 12, active: true },
  { name: "SaaS", count: 3, active: false },
  { name: "Healthcare", count: 2, active: false },
  { name: "Education", count: 2, active: false },
  { name: "Financial Services", count: 2, active: false },
  { name: "Retail", count: 2, active: false },
  { name: "Manufacturing", count: 1, active: false }
];

export default function CaseStudiesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const filteredCaseStudies = caseStudies.filter(study => 
    selectedIndustry === "All" || study.industry === selectedIndustry
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
              Case Studies
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Real-world success stories from companies using Xeinst to transform their operations with AI agents.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <FileText className="w-5 h-5 mr-2" />
                Download All Case Studies
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Play className="w-5 h-5 mr-2" />
                Watch Success Stories
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industry Filter */}
      <section className="py-10 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {industries.map((industry, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndustry(industry.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedIndustry === industry.name
                    ? 'bg-ai-primary text-white'
                    : 'bg-background/50 text-muted-foreground hover:text-white hover:bg-ai-primary/20'
                }`}
              >
                {industry.name} ({industry.count})
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="space-y-12">
            {filteredCaseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300 ${
                  study.featured ? 'bg-gradient-to-r from-ai-primary/5 to-ai-secondary/5' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {study.featured && (
                          <Badge className="bg-gradient-ai text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                          {study.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{study.readTime}</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">{study.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{study.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{study.industry}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{study.companySize}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Challenge & Solution */}
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Challenge</h4>
                          <p className="text-muted-foreground">{study.challenge}</p>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Solution</h4>
                          <p className="text-muted-foreground">{study.solution}</p>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">Results</h4>
                          <ul className="space-y-2">
                            {study.results.map((result, resultIndex) => (
                              <li key={resultIndex} className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{result}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Key Metrics</h4>
                        <div className="space-y-4">
                          {Object.entries(study.metrics).map(([key, value], metricIndex) => (
                            <div key={metricIndex} className="p-4 bg-background/50 rounded-lg border border-ai-primary/10">
                              <div className="text-2xl font-bold text-white mb-1">{value}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 space-y-2">
                          <Button className="w-full bg-gradient-ai hover:bg-gradient-ai/90">
                            <FileText className="w-4 h-4 mr-2" />
                            Read Full Case Study
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button variant="outline" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Ready to Create Your Success Story?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join these companies in transforming their operations with AI agents. 
              Start building your success story today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <ExternalLink className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
