"use client";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Shield, 
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  FileText,
  Users,
  Globe,
  Lock,
  Download,
  MessageSquare,
  Building,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const complianceFrameworks = [
  {
    name: "SOC 2 Type II",
    status: "In Progress",
    description: "Security, availability, and confidentiality controls",
    icon: Shield,
    color: "text-yellow-500",
    timeline: "Q2 2024",
    details: "Comprehensive audit of our security controls, availability, and confidentiality measures."
  },
  {
    name: "ISO 27001",
    status: "Planned",
    description: "Information security management system",
    icon: Award,
    color: "text-blue-500",
    timeline: "Q3 2024",
    details: "International standard for information security management systems."
  },
  {
    name: "HIPAA",
    status: "Available",
    description: "Healthcare data protection (add-on)",
    icon: Users,
    color: "text-green-500",
    timeline: "Available Now",
    details: "Healthcare-specific compliance for organizations handling PHI data."
  },
  {
    name: "FERPA",
    status: "Available",
    description: "Educational records protection (add-on)",
    icon: FileText,
    color: "text-green-500",
    timeline: "Available Now",
    details: "Educational records privacy protection for schools and universities."
  },
  {
    name: "GDPR",
    status: "Compliant",
    description: "EU data protection regulation",
    icon: Globe,
    color: "text-green-500",
    timeline: "Compliant",
    details: "Full compliance with EU General Data Protection Regulation."
  },
  {
    name: "CCPA",
    status: "Compliant",
    description: "California consumer privacy act",
    icon: Lock,
    color: "text-green-500",
    timeline: "Compliant",
    details: "California Consumer Privacy Act compliance for data protection."
  }
];

const securityControls = [
  {
    category: "Access Control",
    controls: [
      "Multi-factor authentication (MFA)",
      "Role-based access control (RBAC)",
      "Single sign-on (SSO) integration",
      "Session management and timeout",
      "Privileged access management"
    ],
    icon: Lock
  },
  {
    category: "Data Protection",
    controls: [
      "Encryption at rest (AES-256)",
      "Encryption in transit (TLS 1.3)",
      "Data classification and labeling",
      "Secure data disposal",
      "Backup encryption and security"
    ],
    icon: Shield
  },
  {
    category: "Monitoring & Logging",
    controls: [
      "Comprehensive audit logging",
      "Real-time security monitoring",
      "Intrusion detection systems",
      "Log integrity protection",
      "Security incident response"
    ],
    icon: Eye
  },
  {
    category: "Infrastructure Security",
    controls: [
      "Network segmentation",
      "Firewall configuration",
      "Vulnerability management",
      "Secure development lifecycle",
      "Regular security assessments"
    ],
    icon: Building
  }
];

const complianceDocuments = [
  {
    title: "Security Whitepaper",
    description: "Comprehensive overview of our security architecture and controls",
    icon: FileText,
    format: "PDF",
    size: "2.3 MB"
  },
  {
    title: "Privacy Policy",
    description: "Detailed privacy policy and data handling practices",
    icon: Shield,
    format: "PDF",
    size: "1.8 MB"
  },
  {
    title: "Data Processing Agreement",
    description: "Standard DPA template for enterprise customers",
    icon: FileText,
    format: "DOCX",
    size: "156 KB"
  },
  {
    title: "Security Questionnaire",
    description: "Pre-filled security questionnaire for procurement",
    icon: CheckCircle,
    format: "PDF",
    size: "892 KB"
  },
  {
    title: "Penetration Test Report",
    description: "Third-party security assessment results",
    icon: Award,
    format: "PDF",
    size: "4.1 MB"
  },
  {
    title: "Incident Response Plan",
    description: "Security incident response procedures and contacts",
    icon: Shield,
    format: "PDF",
    size: "1.2 MB"
  }
];

const industrySolutions = [
  {
    industry: "Healthcare",
    compliance: ["HIPAA", "HITECH", "FDA 21 CFR Part 11"],
    features: [
      "PHI data encryption and access controls",
      "Audit trails for all data access",
      "Business Associate Agreement (BAA)",
      "Healthcare-specific data retention policies"
    ],
    icon: Users
  },
  {
    industry: "Financial Services",
    compliance: ["PCI DSS", "SOX", "GLBA", "Basel III"],
    features: [
      "Financial data protection and encryption",
      "Regulatory reporting capabilities",
      "Fraud detection and prevention",
      "Compliance monitoring and alerting"
    ],
    icon: Building
  },
  {
    industry: "Education",
    compliance: ["FERPA", "COPPA", "State Privacy Laws"],
    features: [
      "Student record protection",
      "Parental consent management",
      "Age-appropriate data handling",
      "Educational institution agreements"
    ],
    icon: FileText
  },
  {
    industry: "Government",
    compliance: ["FedRAMP", "FISMA", "NIST 800-53"],
    features: [
      "Government-grade security controls",
      "Air-gapped deployment options",
      "Security clearance support",
      "Government-specific compliance frameworks"
    ],
    icon: Globe
  }
];

export default function CompliancePage() {
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
              Compliance & Security
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Enterprise-grade compliance and security controls to meet your regulatory requirements 
              and industry standards.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Shield className="w-5 h-5 mr-2" />
                Download Compliance Pack
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Compliance Team
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance Frameworks */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Compliance Frameworks
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
            {complianceFrameworks.map((framework, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center">
                        <framework.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          framework.status === 'Compliant' 
                            ? 'border-green-500/20 text-green-500'
                            : framework.status === 'In Progress'
                            ? 'border-yellow-500/20 text-yellow-500'
                            : framework.status === 'Available'
                            ? 'border-green-500/20 text-green-500'
                            : 'border-blue-500/20 text-blue-500'
                        }`}
                      >
                        {framework.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white">{framework.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {framework.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Timeline: {framework.timeline}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{framework.details}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Controls */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Security Controls
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Comprehensive security controls across all layers
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityControls.map((control, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <control.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{control.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {control.controls.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
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

      {/* Industry Solutions */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Industry-Specific Solutions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Tailored compliance solutions for regulated industries
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industrySolutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <solution.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{solution.industry}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Compliance: {solution.compliance.join(", ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {solution.features.map((feature, featureIndex) => (
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

      {/* Compliance Documents */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Compliance Documents
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Download compliance documentation and security reports
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complianceDocuments.map((document, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <document.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-white">{document.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {document.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{document.format}</span>
                        <span>{document.size}</span>
                      </div>
                      <Button variant="outline" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
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
              Need Compliance Support?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Our compliance team is ready to help you meet your regulatory requirements.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Shield className="w-5 h-5 mr-2" />
                Contact Compliance Team
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Download className="w-5 h-5 mr-2" />
                Download All Documents
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
