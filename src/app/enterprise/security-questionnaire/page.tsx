"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  ArrowRight,
  CheckCircle,
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Globe,
  Building,
  Zap,
  MessageSquare,
  Clock,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const questionnaireSections = [
  {
    title: "Data Security & Encryption",
    questions: [
      "How is data encrypted at rest and in transit?",
      "What encryption standards are used?",
      "How are encryption keys managed?",
      "Is data encrypted in backups?",
      "How is data securely deleted?"
    ],
    icon: Lock
  },
  {
    title: "Access Control & Authentication",
    questions: [
      "What authentication methods are supported?",
      "How is multi-factor authentication implemented?",
      "What role-based access controls are available?",
      "How are user permissions managed?",
      "What session management controls exist?"
    ],
    icon: Users
  },
  {
    title: "Network Security",
    questions: [
      "What network security controls are in place?",
      "How is network traffic monitored?",
      "What firewall configurations are used?",
      "How is network segmentation implemented?",
      "What intrusion detection systems are deployed?"
    ],
    icon: Globe
  },
  {
    title: "Monitoring & Logging",
    questions: [
      "What audit logging capabilities exist?",
      "How long are logs retained?",
      "What security monitoring is performed?",
      "How are security incidents detected?",
      "What alerting mechanisms are in place?"
    ],
    icon: Eye
  },
  {
    title: "Compliance & Certifications",
    questions: [
      "What compliance certifications are held?",
      "How is compliance monitored and maintained?",
      "What third-party audits are performed?",
      "How are compliance gaps addressed?",
      "What regulatory requirements are supported?"
    ],
    icon: Award
  },
  {
    title: "Incident Response",
    questions: [
      "What incident response procedures exist?",
      "How are security incidents reported?",
      "What is the incident response timeline?",
      "How are customers notified of incidents?",
      "What post-incident review processes exist?"
    ],
    icon: Shield
  }
];

const ourAnswers = [
  {
    question: "How is data encrypted at rest and in transit?",
    answer: "All data is encrypted using AES-256 at rest and TLS 1.3 in transit. Database encryption is handled at the storage layer, and all API communications use end-to-end encryption."
  },
  {
    question: "What authentication methods are supported?",
    answer: "We support SAML 2.0, OAuth 2.0, OpenID Connect, and traditional username/password authentication. Multi-factor authentication (MFA) is required for all administrative accounts."
  },
  {
    question: "What compliance certifications are held?",
    answer: "We are currently pursuing SOC 2 Type II certification (expected Q2 2024) and ISO 27001 (expected Q3 2024). We are already compliant with GDPR and CCPA requirements."
  },
  {
    question: "What incident response procedures exist?",
    answer: "We have a comprehensive incident response plan with 24/7 monitoring, automated alerting, and defined escalation procedures. Critical incidents are responded to within 1 hour."
  }
];

const additionalResources = [
  {
    title: "Security Architecture Diagram",
    description: "Visual overview of our security architecture and controls",
    icon: Building,
    format: "PDF"
  },
  {
    title: "Penetration Test Report",
    description: "Latest third-party security assessment results",
    icon: Shield,
    format: "PDF"
  },
  {
    title: "Data Processing Agreement",
    description: "Standard DPA template for enterprise customers",
    icon: FileText,
    format: "DOCX"
  },
  {
    title: "Incident Response Plan",
    description: "Detailed security incident response procedures",
    icon: Zap,
    format: "PDF"
  }
];

export default function SecurityQuestionnairePage() {
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
              Security Questionnaire
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Pre-filled security questionnaire to accelerate your procurement process. 
              Download our comprehensive security assessment responses.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Download className="w-5 h-5 mr-2" />
                Download Questionnaire
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Security Team
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Questionnaire Overview */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Security Assessment Areas
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Comprehensive coverage of all major security domains
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {questionnaireSections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.questions.map((question, questionIndex) => (
                        <li key={questionIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Answers */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Sample Responses
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Preview of our detailed security assessment responses
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {ourAnswers.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Additional Resources
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Supporting documentation for your security review
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalResources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                      <resource.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                    <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20 mb-4">
                      {resource.format}
                    </Badge>
                    <Button variant="outline" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-ai-primary/20 bg-gradient-to-r from-ai-primary/5 to-ai-secondary/5">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Complete Security Questionnaire
                  </h2>
                  <p className="text-xl text-muted-foreground mb-6">
                    Download our comprehensive security questionnaire with detailed responses 
                    to accelerate your procurement and security review process.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                      <Download className="w-5 h-5 mr-2" />
                      Download Full Questionnaire
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Request Custom Responses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
