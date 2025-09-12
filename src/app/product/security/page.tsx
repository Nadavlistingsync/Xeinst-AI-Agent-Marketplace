"use client";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Shield, 
  Play, 
  ArrowRight,
  Lock,
  Eye,
  Download,
  CheckCircle,
  FileText,
  Key,
  Database,
  Globe,
  Users,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption at Rest & Transit",
    description: "AES-256 encryption for data at rest, TLS 1.3 for data in transit",
    details: "All data is encrypted using industry-standard AES-256 encryption. Data in transit is protected with TLS 1.3."
  },
  {
    icon: Key,
    title: "Key Management",
    description: "Hardware Security Modules (HSM) for key storage and rotation",
    details: "Keys are managed using AWS KMS with automatic rotation and hardware security module protection."
  },
  {
    icon: Database,
    title: "Secrets Vault",
    description: "Secure storage and management of API keys and credentials",
    details: "Centralized secrets management with encrypted storage, access controls, and audit logging."
  },
  {
    icon: Users,
    title: "Identity & Access Management",
    description: "SSO, SAML, SCIM, and granular RBAC controls",
    details: "Enterprise-grade identity management with support for major identity providers and fine-grained permissions."
  },
  {
    icon: Eye,
    title: "Audit Logging",
    description: "Comprehensive audit trails for all system activities",
    details: "Complete audit logs for compliance, security monitoring, and forensic analysis with tamper-proof storage."
  },
  {
    icon: Globe,
    title: "Data Residency",
    description: "Control where your data is stored and processed",
    details: "Choose data residency options to meet regulatory requirements with regional data centers."
  }
];

const complianceItems = [
  {
    title: "SOC 2 Type II",
    status: "In Progress",
    description: "Security, availability, and confidentiality controls",
    icon: CheckCircle,
    color: "text-yellow-500"
  },
  {
    title: "ISO 27001",
    status: "Planned",
    description: "Information security management system",
    icon: Clock,
    color: "text-blue-500"
  },
  {
    title: "HIPAA",
    status: "Available",
    description: "Healthcare data protection (add-on)",
    icon: Shield,
    color: "text-green-500"
  },
  {
    title: "FERPA",
    status: "Available", 
    description: "Educational records protection (add-on)",
    icon: FileText,
    color: "text-green-500"
  }
];

const securityArchitecture = [
  {
    layer: "Application Layer",
    features: ["RBAC", "API Authentication", "Input Validation", "Rate Limiting"]
  },
  {
    layer: "Network Layer", 
    features: ["TLS 1.3", "WAF", "DDoS Protection", "VPN Access"]
  },
  {
    layer: "Data Layer",
    features: ["AES-256 Encryption", "Database Encryption", "Backup Encryption", "Key Rotation"]
  },
  {
    layer: "Infrastructure Layer",
    features: ["HSM", "Secure Boot", "Container Security", "Network Segmentation"]
  }
];

export default function SecurityPage() {
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
              Enterprise Security
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Bank-level security with SOC 2 compliance, encryption, and comprehensive audit trails. 
              Built for enterprise requirements.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Shield className="w-5 h-5 mr-2" />
                Download Security Whitepaper
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Play className="w-5 h-5 mr-2" />
                Security Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Security Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Comprehensive security controls for enterprise environments
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.details}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Compliance & Certifications
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Meeting industry standards and regulatory requirements
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {complianceItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <Badge 
                      variant="outline" 
                      className={`mb-4 ${
                        item.status === 'Available' 
                          ? 'border-green-500/20 text-green-500'
                          : item.status === 'In Progress'
                          ? 'border-yellow-500/20 text-yellow-500'
                          : 'border-blue-500/20 text-blue-500'
                      }`}
                    >
                      {item.status}
                    </Badge>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Security Architecture
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Defense in depth with multiple security layers
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {securityArchitecture.map((layer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl text-white">{layer.layer}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {layer.features.map((feature, featureIndex) => (
                          <Badge 
                            key={featureIndex}
                            variant="secondary" 
                            className="bg-ai-primary/10 text-ai-primary border-ai-primary/20"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Resources */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Security Resources
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Download security documentation and compliance materials
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Security Whitepaper</h3>
                  <p className="text-muted-foreground mb-4">Comprehensive security overview and architecture details</p>
                  <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Security Questionnaire</h3>
                  <p className="text-muted-foreground mb-4">Pre-filled security questionnaire for procurement</p>
                  <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">SOC 2 Report</h3>
                  <p className="text-muted-foreground mb-4">Third-party security audit report (available Q2 2024)</p>
                  <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                    <Download className="w-4 h-4 mr-2" />
                    Request Access
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
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
              Have Security Questions?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Our security team is ready to answer your questions and help with compliance requirements.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Shield className="w-5 h-5 mr-2" />
                Contact Security Team
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <FileText className="w-5 h-5 mr-2" />
                Security FAQ
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
