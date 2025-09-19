import { WebhookAgentTester } from "../../components/WebhookAgentTester";
import { Button } from "../../components/ui";
import { ArrowLeft, BookOpen, Code, Zap } from 'lucide-react';
import Link from 'next/link';

export default function TestWebhookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              Agent Testing
            </div>
          </div>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Agent Setup & Testing
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Configure and test your webhook-based AI agents with our intuitive step-by-step interface. 
              Perfect for developers and non-technical users alike.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Quick Setup</div>
                  <div className="text-sm text-muted-foreground">4 simple steps</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Webhook Ready</div>
                  <div className="text-sm text-muted-foreground">Test any endpoint</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Pre-built Agents</div>
                  <div className="text-sm text-muted-foreground">Ready to use</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <WebhookAgentTester />
        
        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t">
          <div className="max-w-4xl mx-auto text-center text-muted-foreground">
            <p className="mb-4">
              Need help? Check out our{' '}
              <Link href="/guide" className="text-primary hover:underline">
                comprehensive guide
              </Link>{' '}
              or{' '}
              <Link href="/api/run-agent" className="text-primary hover:underline">
                API documentation
              </Link>
              .
            </p>
            <p className="text-sm">
              This testing interface helps you validate your webhook-based agents before deploying them to production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 