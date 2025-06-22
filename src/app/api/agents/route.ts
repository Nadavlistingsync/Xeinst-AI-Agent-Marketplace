import { NextResponse } from 'next/server';
import { z } from 'zod';

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  apiUrl: z.string().url(),
  inputSchema: z.any(),
});

export type Agent = z.infer<typeof agentSchema>;

const exampleAgents: Agent[] = [
  {
    id: '1',
    name: 'Text Summarizer',
    description: 'Summarizes a long text into a few key sentences.',
    apiUrl: 'https://api.example.com/summarize',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text to summarize.' },
        sentences: { type: 'number', description: 'Number of sentences in the summary.' },
      },
      required: ['text', 'sentences'],
    },
  },
  {
    id: '2',
    name: 'Image Classifier',
    description: 'Classifies the content of an image from a URL.',
    apiUrl: 'https://api.example.com/classify',
    inputSchema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', description: 'URL of the image to classify.' },
      },
      required: ['imageUrl'],
    },
  },
    {
    id: '3',
    name: 'Sentiment Analysis',
    description: 'Analyzes the sentiment of a piece of text (positive, negative, or neutral).',
    apiUrl: 'https://api.example.com/sentiment',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text to analyze.' },
      },
      required: ['text'],
    },
  },
];

export async function GET() {
  // In a real application, you would fetch this from a database.
  // We'll add a short delay to simulate a network request.
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(exampleAgents);
} 