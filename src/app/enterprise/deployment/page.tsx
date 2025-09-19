"use client";

import { Button } from "../../../components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Cloud, 
  ArrowRight,
  Shield,
  Database,
  Building,
  CheckCircle,
  Zap,
  Users,
  Download,
  MessageSquare,
  FileText,
  Server
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const deploymentModels = [
  {
    name: "Public Cloud",
    description: "Fully managed service on our infrastructure",
    icon: Cloud,
    color: "from-blue-500 to-purple-500",
    features: [
      "Fastest deployment (minutes)",
      "Automatic updates and maintenance",
      "Global CDN and edge locations",
      "Managed scaling and load balancing",
      "99.9% uptime SLA",
      "24/7 monitoring and support"
    ],
    pros: ["Lowest operational overhead", "Fastest time to value", "Automatic scaling"],
    cons: ["Less control over infrastructure", "Data stored in our cloud"],
    bestFor: "Most organizations wanting fast deployment with minimal operational overhead"
  },
  {
    name: "VPC Deployment",
    description: "Dedicated virtual private cloud environment",
    icon: Shield,
    color: "from-green-500 to-teal-500",
    features: [
      "Network isolation and security",
      "Custom network configurations",
      "Hybrid cloud connectivity",
      "Enhanced security controls",
      "Dedicated resources",
      "Custom compliance configurations"
    ],
    pros: ["Enhanced security", "Network isolation", "Hybrid connectivity"],
    cons: ["Higher cost", "More complex setup"],
    bestFor: "Organizations requiring enhanced security and network isolation"
  },
  {
    name: "Private Cloud",
    description: "Deploy in your preferred cloud provider",
    icon: Database,
    color: "from-orange-500 to-red-500",
    features: [
      "Your cloud infrastructure (AWS, Azure, GCP)",
      "Full control over deployment",
      "Custom compliance requirements",
      "Data sovereignty",
      "Integration with existing cloud services",
      "Custom monitoring and logging"
    ],
    pros: ["Full infrastructure control", "Data sovereignty", "Cloud provider choice"],
    cons: ["Requires cloud expertise", "Higher operational overhead"],
    bestFor: "Organizations with existing cloud infrastructure and expertise"
  },
  {
    name: "On-Premise",
    description: "Deploy in your own data center",
    icon: Building,
    color: "from-purple-500 to-pink-500",
    features: [
      "Complete air-gapped deployment",
      "Custom hardware requirements",
      "Full data sovereignty",
      "Custom compliance frameworks",
      "Offline operation capability",
      "Complete infrastructure control"
    ],
    pros: ["Complete isolation", "Full control", "Air-gapped security"],
    cons: ["Highest cost", "Requires significant expertise", "Longer deployment time"],
    bestFor: "Highly regulated industries requiring complete data isolation"
  }
];

const deploymentSteps = [
  {
    step: "1",
    title: "Assessment & Planning",
    description: "Evaluate your requirements and choose the right deployment model",
    icon: FileText,
    duration: "1-2 weeks"
  },
  {
    step: "2",
    title: "Infrastructure Setup",
    description: "Configure your chosen deployment environment",
    icon: Server,
    duration: "1-4 weeks"
  },
  {
    step: "3",
    title: "Platform Installation",
    description: "Deploy Xeinst platform and configure integrations",
    icon: Zap,
    duration: "1-2 weeks"
  },
  {
    step: "4",
    title: "Testing & Validation",
    description: "Comprehensive testing and security validation",
    icon: CheckCircle,
    duration: "1-2 weeks"
  },
  {
    step: "5",
    title: "Go Live & Support",
    description: "Production deployment with ongoing support",
    icon: Users,
    duration: "Ongoing"
  }
];

const technicalRequirements = [
  {
    category: "Compute",
    requirements: [
      "Minimum 8 CPU cores",
      "32GB RAM",
      "100GB SSD storage",
      "Docker container support"
    ]
  },
  {
    category: "Network",
    requirements: [
      "1Gbps network connection",
      "Load balancer support",
      "SSL/TLS termination",
      "Firewall configuration"
    ]
  },
  {
    category: "Storage",
    requirements: [
      "500GB+ persistent storage",
      "Database storage (PostgreSQL)",
      "File storage for agents",
      "Backup storage capacity"
    ]
  },
  {
    category: "Security",
    requirements: [
      "SSL/TLS certificates",
      "Network segmentation",
      "Access control lists",
      "Audit logging capability"
    ]
  }
];

export default function DeploymentPage() {
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
              Deployment Options
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Choose the deployment model that fits your security, compliance, and operational requirements.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Cloud className="w-5 h-5 mr-2" />
                Start Deployment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Download className="w-5 h-5 mr-2" />
                Download Guide
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deployment Models */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Deployment Models
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Four deployment options to meet your specific requirements
            </motion.p>
          </div>

          <div className="space-y-12">
            {deploymentModels.map((model, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${model.color} flex items-center justify-center`}>
                        <model.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl text-white">{model.name}</CardTitle>
                        <CardDescription className="text-muted-foreground text-lg">
                          {model.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Features */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
                        <ul className="space-y-2">
                          {model.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pros */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Advantages</h4>
                        <ul className="space-y-2">
                          {model.pros.map((pro, proIndex) => (
                            <li key={proIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-muted-foreground">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Considerations</h4>
                        <ul className="space-y-2">
                          {model.cons.map((con, conIndex) => (
                            <li key={conIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-muted-foreground">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-ai-primary/5 rounded-lg border border-ai-primary/20">
                      <h5 className="text-white font-semibold mb-2">Best For:</h5>
                      <p className="text-muted-foreground">{model.bestFor}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Process */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Deployment Process
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Our structured approach ensures successful deployment
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {deploymentSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                        {step.duration}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Requirements */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Technical Requirements
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Minimum requirements for on-premise and private cloud deployments
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalRequirements.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.requirements.map((requirement, reqIndex) => (
                        <li key={reqIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{requirement}</span>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Ready to Deploy?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Let's discuss your deployment requirements and get you started.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Cloud className="w-5 h-5 mr-2" />
                Start Deployment Planning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Technical Team
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
