"use client";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  RefreshCw,
  Bell,
  Mail,
  Twitter,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const services = [
  {
    name: "API Gateway",
    status: "operational",
    uptime: "99.99%",
    responseTime: "45ms",
    lastIncident: "2024-01-05",
    description: "Main API endpoint for all Xeinst services"
  },
  {
    name: "Agent Builder",
    status: "operational",
    uptime: "99.95%",
    responseTime: "120ms",
    lastIncident: "2024-01-02",
    description: "Visual agent building and configuration service"
  },
  {
    name: "Orchestration Engine",
    status: "operational",
    uptime: "99.98%",
    responseTime: "85ms",
    lastIncident: "2023-12-28",
    description: "Agent execution and workflow orchestration"
  },
  {
    name: "Observability Platform",
    status: "operational",
    uptime: "99.97%",
    responseTime: "65ms",
    lastIncident: "2023-12-20",
    description: "Monitoring, logging, and analytics service"
  },
  {
    name: "Guardrails Service",
    status: "operational",
    uptime: "99.99%",
    responseTime: "35ms",
    lastIncident: "2023-12-15",
    description: "Security and compliance enforcement"
  },
  {
    name: "Integration Hub",
    status: "operational",
    uptime: "99.96%",
    responseTime: "95ms",
    lastIncident: "2023-12-10",
    description: "Third-party service integrations"
  },
  {
    name: "Authentication Service",
    status: "operational",
    uptime: "99.99%",
    responseTime: "25ms",
    lastIncident: "2023-11-30",
    description: "User authentication and authorization"
  },
  {
    name: "Database Cluster",
    status: "operational",
    uptime: "99.99%",
    responseTime: "15ms",
    lastIncident: "2023-11-25",
    description: "Primary database infrastructure"
  }
];

const recentIncidents = [
  {
    id: "INC-2024-001",
    title: "API Gateway Performance Degradation",
    status: "resolved",
    severity: "minor",
    startTime: "2024-01-05T14:30:00Z",
    endTime: "2024-01-05T16:45:00Z",
    duration: "2h 15m",
    description: "Increased response times for API requests due to high load",
    impact: "Some users experienced slower response times",
    resolution: "Scaled up API gateway instances and optimized database queries"
  },
  {
    id: "INC-2024-002",
    title: "Agent Builder UI Loading Issues",
    status: "resolved",
    severity: "minor",
    startTime: "2024-01-02T09:15:00Z",
    endTime: "2024-01-02T11:30:00Z",
    duration: "2h 15m",
    description: "Intermittent loading issues with the visual agent builder",
    impact: "Some users unable to access agent builder interface",
    resolution: "Fixed frontend asset loading and CDN configuration"
  },
  {
    id: "INC-2023-089",
    title: "Orchestration Engine Timeout Errors",
    status: "resolved",
    severity: "major",
    startTime: "2023-12-28T20:00:00Z",
    endTime: "2023-12-29T02:30:00Z",
    duration: "6h 30m",
    description: "Agent execution timeouts affecting workflow completion",
    impact: "Some agent workflows failed to complete successfully",
    resolution: "Increased timeout limits and optimized execution pipeline"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "operational":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "degraded":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case "outage":
      return <XCircle className="w-5 h-5 text-red-500" />;
    case "maintenance":
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <CheckCircle className="w-5 h-5 text-green-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "operational":
      return "bg-green-500/20 text-green-500 border-green-500/20";
    case "degraded":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
    case "outage":
      return "bg-red-500/20 text-red-500 border-red-500/20";
    case "maintenance":
      return "bg-blue-500/20 text-blue-500 border-blue-500/20";
    default:
      return "bg-green-500/20 text-green-500 border-green-500/20";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-500 border-red-500/20";
    case "major":
      return "bg-orange-500/20 text-orange-500 border-orange-500/20";
    case "minor":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-gray-500/20 text-gray-500 border-gray-500/20";
  }
};

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(refreshStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const overallStatus = services.every(service => service.status === "operational") 
    ? "operational" 
    : services.some(service => service.status === "outage") 
    ? "outage" 
    : "degraded";

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
              System Status
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Real-time status of all Xeinst services and infrastructure. We're committed to maintaining 99.9% uptime.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10"
                onClick={refreshStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Bell className="w-5 h-5 mr-2" />
                Subscribe to Updates
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Overall Status */}
      <section className="py-10 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-3 mb-4">
              {getStatusIcon(overallStatus)}
              <h2 className="text-3xl font-bold text-white">
                All Systems {overallStatus === "operational" ? "Operational" : "Experiencing Issues"}
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
            <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
              <span>99.97% uptime over the past 30 days</span>
              <span>•</span>
              <span>Average response time: 65ms</span>
              <span>•</span>
              <span>0 active incidents</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
            Service Status
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg text-white">{service.name}</CardTitle>
                      {getStatusIcon(service.status)}
                    </div>
                    <CardDescription className="text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="text-sm text-white font-medium">{service.uptime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <span className="text-sm text-white font-medium">{service.responseTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Incident</span>
                        <span className="text-sm text-white font-medium">
                          {new Date(service.lastIncident).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
            Recent Incidents
          </motion.h2>
          
          <div className="space-y-6">
            {recentIncidents.map((incident, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl text-white">{incident.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>ID: {incident.id}</span>
                      <span>•</span>
                      <span>Duration: {incident.duration}</span>
                      <span>•</span>
                      <span>{new Date(incident.startTime).toLocaleString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Description</h4>
                        <p className="text-muted-foreground">{incident.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Impact</h4>
                        <p className="text-muted-foreground">{incident.impact}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">Resolution</h4>
                        <p className="text-muted-foreground">{incident.resolution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Stay Informed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Get notified about service status updates, incidents, and maintenance windows.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Mail className="w-5 h-5 mr-2" />
                Email Updates
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Twitter className="w-5 h-5 mr-2" />
                Twitter Updates
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Bell className="w-5 h-5 mr-2" />
                RSS Feed
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
