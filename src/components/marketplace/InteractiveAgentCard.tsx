'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Agent } from '@/app/api/agents/route';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      {Object.keys(schema.properties).map(key => {
        const prop = schema.properties[key];
        const isTextarea = prop.type === 'string' && prop.description.toLowerCase().includes('text');

        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{prop.description}</Label>
            {isTextarea ? (
              <Textarea id={key} {...register(key)} className="bg-gray-800 border-gray-700" />
            ) : (
              <Input id={key} type={prop.type} {...register(key)} className="bg-gray-800 border-gray-700" />
            )}
            {errors[key] && <p className="text-sm text-red-500">{errors[key]?.message as string}</p>}
          </div>
        );
      })}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Run
      </Button>
    </form>
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
      // Call the real agent run API endpoint
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

  return (
    <Card className="flex flex-col justify-between bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
        <CardDescription>{agent.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div>
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
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <Alert className="mt-4 bg-gray-800 border-gray-700">
                <AlertTitle>Result</AlertTitle>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleRunAgentClick} variant="outline" className="w-full">
          {showForm ? 'Hide Form' : 'Run Agent'}
        </Button>
      </CardFooter>
    </Card>
  );
} 