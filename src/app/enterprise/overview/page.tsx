"use client";

import { Button } from "../../../components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Building, 
  ArrowRight,
  Shield,
  Users,
  Globe,
  Database,
  CheckCircle,
  Zap,
  Lock,
  Download,
  MessageSquare,
  FileText,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const enterpriseFeatures = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II, ISO 27001, and custom compliance frameworks",
    details: "Bank-level security with end-to-end encryption, audit logs, and compliance certifications."
  },
  {
    icon: Users,
    title: "Identity & Access Management",
    description: "SSO, SAML, SCIM, and granular RBAC controls",
    details: "Seamless integration with your existing identity providers and fine-grained permission management."
  },
  {
    icon: Database,
    title: "Data Residency & Privacy",
    description: "Control where your data is stored and processed",
    details: "Choose data residency options to meet regulatory requirements with regional data centers."
  },
  {
    icon: Globe,
    title: "VPC & Private Cloud",
    description: "Deploy in your own infrastructure or private cloud",
    details: "Full control over your deployment with VPC, on-premise, or private cloud options."
  },
  {
    icon: Zap,
    title: "SLA Guarantees",
    description: "99.9% uptime with dedicated support and monitoring",
    details: "Enterprise-grade reliability with guaranteed uptime and dedicated technical support."
  },
  {
    icon: Lock,
    title: "Private Models",
    description: "Use your own AI models and keep data private",
    details: "Deploy with your own models or use private instances to ensure complete data privacy."
  }
];

const deploymentOptions = [
  {
    name: "Public Cloud",
    description: "Fully managed service on our infrastructure",
    features: ["Fastest deployment", "Automatic updates", "Global CDN", "Managed scaling"],
    icon: Globe
  },
  {
    name: "VPC Deployment",
    description: "Dedicated virtual private cloud environment",
    features: ["Network isolation", "Custom configurations", "Hybrid connectivity", "Enhanced security"],
    icon: Shield
  },
  {
    name: "Private Cloud",
    description: "Deploy in your preferred cloud provider",
    features: ["Your infrastructure", "Full control", "Custom compliance", "Data sovereignty"],
    icon: Database
  },
  {
    name: "On-Premise",
    description: "Deploy in your own data center",
    features: ["Complete isolation", "Air-gapped deployment", "Custom hardware", "Regulatory compliance"],
    icon: Building
  }
];

const complianceStandards = [
  {
    name: "SOC 2 Type II",
    status: "In Progress",
    description: "Security, availability, and confidentiality controls",
    icon: Shield,
    color: "text-yellow-500"
  },
  {
    name: "ISO 27001",
    status: "Planned",
    description: "Information security management system",
    icon: Award,
    color: "text-blue-500"
  },
  {
    name: "HIPAA",
    status: "Available",
    description: "Healthcare data protection (add-on)",
    icon: FileText,
    color: "text-green-500"
  },
  {
    name: "FERPA",
    status: "Available",
    description: "Educational records protection (add-on)",
    icon: Users,
    color: "text-green-500"
  },
  {
    name: "GDPR",
    status: "Compliant",
    description: "EU data protection regulation",
    icon: Globe,
    color: "text-green-500"
  },
  {
    name: "CCPA",
    status: "Compliant",
    description: "California consumer privacy act",
    icon: Lock,
    color: "text-green-500"
  }
];

const procurementPack = [
  {
    title: "Security Whitepaper",
    description: "Comprehensive security overview and architecture details",
    icon: FileText,
    format: "PDF"
  },
  {
    title: "Security Questionnaire",
    description: "Pre-filled security questionnaire for procurement",
    icon: Shield,
    format: "PDF"
  },
  {
    title: "SOC 2 Report",
    description: "Third-party security audit report (available Q2 2024)",
    icon: Award,
    format: "PDF"
  },
  {
    title: "DPA Template",
    description: "Data Processing Agreement template",
    icon: FileText,
    format: "DOCX"
  }
];

export default function EnterpriseOverviewPage() {
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
              Enterprise Solutions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Enterprise-grade AI agent platform with advanced security, compliance, 
              and deployment options for large organizations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Building className="w-5 h-5 mr-2" />
                Contact Sales
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Download className="w-5 h-5 mr-2" />
                Download Enterprise Guide
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Enterprise Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Built for enterprise requirements with advanced security and compliance
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {enterpriseFeatures.map((feature, index) => (
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

      {/* Deployment Options */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Deployment Options
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Choose the deployment model that fits your security and compliance needs
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {deploymentOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4 mx-auto">
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{option.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {option.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
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

      {/* Compliance */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complianceStandards.map((standard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                      <standard.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{standard.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`mb-4 ${
                        standard.status === 'Compliant' 
                          ? 'border-green-500/20 text-green-500'
                          : standard.status === 'In Progress'
                          ? 'border-yellow-500/20 text-yellow-500'
                          : standard.status === 'Available'
                          ? 'border-green-500/20 text-green-500'
                          : 'border-blue-500/20 text-blue-500'
                      }`}
                    >
                      {standard.status}
                    </Badge>
                    <p className="text-muted-foreground text-sm">{standard.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Procurement Pack */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Procurement Pack
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need for enterprise procurement and compliance review
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {procurementPack.map((item, index) => (
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
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                    <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20 mb-4">
                      {item.format}
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
              Ready for Enterprise?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Let's discuss how Xeinst can meet your enterprise requirements and compliance needs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Building className="w-5 h-5 mr-2" />
                Contact Enterprise Sales
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <MessageSquare className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
