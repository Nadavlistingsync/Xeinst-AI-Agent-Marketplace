'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Agent } from '../../app/api/agents/route';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { 
  Loader2, 
  Play, 
  EyeOff, 
  Download, 
  Star, 
  Zap,
  Bot,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to generate Zod schema from JSON schema
const generateZodSchema = (jsonSchema: any) => {
  const shape: { [key: string]: z.ZodType<any, any> } = {};
  for (const key in jsonSchema.properties) {
    const prop = jsonSchema.properties[key];
    let field: z.ZodType<any, any>;

    switch (prop.type) {
      case 'number':
        field = z.number({ required_error: `${prop.description} is required.` });
        break;
      case 'string':
      default:
        field = z.string().min(1, `${prop.description} is required.`);
        break;
    }
    shape[key] = field;
  }
  return z.object(shape);
};

// The DynamicForm component
const DynamicForm = ({ schema, onSubmit, isLoading }: { schema: any, onSubmit: (data: any) => void, isLoading: boolean }) => {
  const zodSchema = generateZodSchema(schema);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(zodSchema),
  });

  return (
    <motion.form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-4 mt-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Object.keys(schema.properties).map(key => {
        const prop = schema.properties[key];
        const isTextarea = prop.type === 'string' && prop.description.toLowerCase().includes('text');

        return (
          <motion.div 
            key={key} 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Label htmlFor={key} className="text-sm font-medium text-foreground">
              {prop.description}
            </Label>
            {isTextarea ? (
              <Textarea 
                id={key} 
                {...register(key)} 
                className="input-modern min-h-[100px] resize-none"
                placeholder={`Enter ${prop.description.toLowerCase()}...`}
              />
            ) : (
              <Input 
                id={key} 
                type={prop.type} 
                {...register(key)} 
                className="input-modern"
                placeholder={`Enter ${prop.description.toLowerCase()}...`}
              />
            )}
            {errors[key] && (
              <motion.p 
                className="text-sm text-ai-error flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-3 h-3" />
                {errors[key]?.message as string}
              </motion.p>
            )}
          </motion.div>
        );
      })}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full btn-primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Agent
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
};

export function InteractiveAgentCard({ agent }: { agent: Agent }) {
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunAgentClick = () => {
    setShowForm(!showForm);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/agents/${agent.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to run agent');
      }
      setResult(result);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'webhook':
        return <Zap className="w-5 h-5" />;
      case 'internet-executor':
        return <Globe className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="flex flex-col justify-between h-full glass-card group hover:shadow-glow transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-ai rounded-xl flex items-center justify-center">
                {getAgentIcon('default')}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-white group-hover:text-ai-primary transition-colors">
                  {agent.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="badge-primary text-xs">
                    {'agent'}
                  </Badge>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs ml-1">4.8</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {agent.description}
          </CardDescription>
          
          {/* Agent Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>2.3s</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>1.2k</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-ai-success">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs">Active</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DynamicForm 
                  schema={agent.inputSchema || {
                    properties: {
                      input: {
                        type: 'string',
                        description: 'Enter your input'
                      }
                    }
                  }} 
                  onSubmit={handleSubmit} 
                  isLoading={isLoading} 
                />
                
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                  
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert className="mt-4 bg-ai-success/10 border-ai-success/30">
                        <CheckCircle className="h-4 w-4 text-ai-success" />
                        <AlertTitle className="text-ai-success">Success</AlertTitle>
                        <AlertDescription>
                          <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-lg mt-2 overflow-auto max-h-40">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="pt-4">
          <Button 
            onClick={handleRunAgentClick} 
            variant="outline" 
            className="w-full btn-secondary group"
          >
            {showForm ? (
              <>
                <EyeOff className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                Hide Form
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                Run Agent
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 