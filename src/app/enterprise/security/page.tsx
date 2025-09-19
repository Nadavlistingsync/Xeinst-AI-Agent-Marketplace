import { Metadata } from 'next';
// Security dashboard removed for liquid design
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle, 
  Activity,
  Database,
  Globe,
  FileText,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enterprise Security | Xeinst',
  description: 'Comprehensive enterprise security measures, compliance, and data protection for Xeinst platform.',
  keywords: 'enterprise security, compliance, data protection, GDPR, SOC2, security dashboard',
};

const securityFeatures = [
  {
    icon: Shield,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit and at rest using AES-256 encryption with enterprise-grade key management.',
    features: ['AES-256 encryption', 'TLS 1.3 in transit', 'Encrypted database storage', 'Key rotation policies']
  },
  {
    icon: Lock,
    title: 'Multi-Factor Authentication',
    description: 'Advanced authentication with MFA, SSO, and enterprise identity providers for maximum security.',
    features: ['SAML 2.0 SSO', 'OAuth 2.0 integration', 'TOTP support', 'Hardware key support']
  },
  {
    icon: Eye,
    title: 'Advanced Monitoring',
    description: 'Real-time security monitoring with AI-powered threat detection and automated incident response.',
    features: ['Real-time monitoring', 'AI threat detection', 'Automated response', 'Security analytics']
  },
  {
    icon: Database,
    title: 'Data Protection',
    description: 'Comprehensive data protection with backup, recovery, and privacy controls for enterprise compliance.',
    features: ['Automated backups', 'Point-in-time recovery', 'Data anonymization', 'Privacy controls']
  },
  {
    icon: Globe,
    title: 'Network Security',
    description: 'Enterprise-grade network security with DDoS protection, WAF, and secure API endpoints.',
    features: ['DDoS protection', 'Web Application Firewall', 'API rate limiting', 'IP whitelisting']
  },
  {
    icon: FileText,
    title: 'Compliance & Auditing',
    description: 'Full compliance with industry standards including GDPR, SOC2, and comprehensive audit logging.',
    features: ['GDPR compliance', 'SOC2 Type II', 'Audit logging', 'Compliance reporting']
  }
];

const complianceStandards = [
  {
    name: 'GDPR',
    status: 'Compliant',
    description: 'General Data Protection Regulation compliance with data privacy controls and user rights management.',
    icon: Shield,
    color: 'bg-green-500'
  },
  {
    name: 'SOC 2 Type II',
    status: 'Certified',
    description: 'Service Organization Control 2 Type II certification for security, availability, and confidentiality.',
    icon: Award,
    color: 'bg-blue-500'
  },
  {
    name: 'CCPA',
    status: 'Compliant',
    description: 'California Consumer Privacy Act compliance with data transparency and consumer rights.',
    icon: FileText,
    color: 'bg-purple-500'
  },
  {
    name: 'ISO 27001',
    status: 'Certified',
    description: 'International standard for information security management systems and controls.',
    icon: CheckCircle,
    color: 'bg-orange-500'
  }
];

const securityMetrics = [
  {
    title: '99.99% Uptime',
    description: 'Enterprise-grade availability with redundant infrastructure and failover systems.',
    icon: Activity
  },
  {
    title: '< 100ms Response Time',
    description: 'Optimized performance with global CDN and edge computing for fast response times.',
    icon: Globe
  },
  {
    title: '24/7 Security Monitoring',
    description: 'Round-the-clock security monitoring with dedicated security operations center.',
    icon: Eye
  },
  {
    title: 'Zero Data Breaches',
    description: 'Proven track record with comprehensive security measures and incident response.',
    icon: Shield
  }
];

export default function EnterpriseSecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <Shield className="h-4 w-4 mr-2" />
              Enterprise Security
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Enterprise-Grade Security
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Comprehensive security measures, compliance, and data protection designed for enterprise needs. 
              Trust Xeinst with your most sensitive AI operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
                View Security Dashboard
              </button>
              <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                Download Security Report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Metrics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityMetrics.map((metric, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <metric.icon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{metric.title}</h3>
                  <p className="text-slate-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Security Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Enterprise-grade security measures that protect your data, users, and operations at every level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-slate-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Meet the highest industry standards with comprehensive compliance and certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceStandards.map((standard, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className={`${standard.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <standard.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{standard.name}</h3>
                  <Badge variant="outline" className="mb-3">
                    {standard.status}
                  </Badge>
                  <p className="text-sm text-slate-600">{standard.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Dashboard Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Real-Time Security Monitoring
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Monitor your security posture with our comprehensive dashboard and real-time alerts.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="p-8 text-center text-white/60">
              <Shield className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Security Dashboard</h3>
              <p>Advanced security monitoring coming soon with liquid design</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Secure Your AI Operations?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Contact our security team to discuss your enterprise security requirements and get a custom security assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
              Contact Security Team
            </button>
            <button className="border border-slate-300 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
              Schedule Security Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
