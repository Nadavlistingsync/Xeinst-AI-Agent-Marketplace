import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from './prisma';
import { logAgentEvent } from './agent-monitoring';
import { z } from 'zod';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// Schema for agent execution input
const agentExecutionInputSchema = z.object({
  input: z.any(),
  parameters: z.record(z.any()).optional(),
});

export interface AgentExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  tokensUsed?: number;
}

export interface AgentExecutionOptions {
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Downloads agent file from S3 and extracts execution logic
 */
async function downloadAgentFile(source: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: source,
    });

    const response = await s3.send(command);
    const fileContent = await response.Body?.transformToString();
    
    if (!fileContent) {
      throw new Error('Failed to read agent file content');
    }

    return fileContent;
  } catch (error) {
    console.error('Error downloading agent file:', error);
    throw new Error('Failed to download agent file from S3');
  }
}

/**
 * Executes agent code with the given input
 */
async function executeAgentCode(
  agentCode: string, 
  input: any
): Promise<AgentExecutionResult> {
  try {
    // For now, we'll implement a basic execution system
    // In a production environment, this would be more sophisticated
    
    // Parse the agent code to extract execution logic
    // This is a simplified version - in reality, you'd need proper code parsing
    const executionResult = await executeAgentLogic(agentCode, input);
    
    return {
      success: true,
      data: executionResult,
      executionTime: Date.now(),
    };
  } catch (error) {
    console.error('Error executing agent code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown execution error',
    };
  }
}

/**
 * Simplified agent logic execution
 * In a real implementation, this would parse and execute the actual agent code
 */
async function executeAgentLogic(
  agentCode: string, 
  input: any
): Promise<any> {
  // This is a placeholder implementation
  // In a real system, you would:
  // 1. Parse the agent code (Python, JavaScript, etc.)
  // 2. Set up a secure execution environment
  // 3. Execute the code with the provided input
  // 4. Return the result
  
  // For now, we'll simulate execution based on the agent code content
  if (agentCode.includes('lead') || agentCode.includes('scraper')) {
    // Simulate lead scraping logic
    return {
      leads: [
        { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0124' },
      ],
      totalFound: 2,
      searchQuery: input.input || input.query,
    };
  } else if (agentCode.includes('analyzer') || agentCode.includes('sentiment')) {
    // Simulate sentiment analysis
    return {
      sentiment: 'positive',
      confidence: 0.85,
      keywords: ['good', 'excellent', 'amazing'],
      text: input.input || input.text,
    };
  } else {
    // Generic agent response
    return {
      result: `Processed input: ${JSON.stringify(input)}`,
      timestamp: new Date().toISOString(),
      agentType: 'generic',
    };
  }
}

/**
 * Main function to execute an agent
 */
export async function executeAgent(
  agentId: string,
  input: any,
  options: AgentExecutionOptions = {}
): Promise<AgentExecutionResult> {
  const startTime = Date.now();
  
  try {
    // Get agent details from database
    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return {
        success: false,
        error: 'Agent not found',
      };
    }

    if (agent.status !== 'active') {
      return {
        success: false,
        error: 'Agent is not active',
      };
    }

    // Validate input
    const validatedInput = agentExecutionInputSchema.parse({ input });

    // Log execution start
    await logAgentEvent(agentId, 'info', 'Agent execution started', {
      input: validatedInput,
      options,
    });

    // Download agent file
    const agentCode = await downloadAgentFile(agent.source);

    // Execute agent
    const result = await executeAgentCode(agentCode, validatedInput.input);

    // Log execution completion
    await logAgentEvent(agentId, 'info', 'Agent execution completed', {
      success: result.success,
      executionTime: Date.now() - startTime,
      error: result.error,
    });

    // Update metrics
    await updateExecutionMetrics(agentId, result.success, Date.now() - startTime);

    return {
      ...result,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Error in executeAgent:', error);
    
    // Log error
    await logAgentEvent(agentId, 'error', 'Agent execution failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startTime,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown execution error',
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Update execution metrics for the agent
 */
async function updateExecutionMetrics(
  deploymentId: string, 
  success: boolean, 
  executionTime: number
): Promise<void> {
  try {
    const existingMetrics = await prisma.agentMetrics.findFirst({
      where: { deploymentId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingMetrics) {
      // Update existing metrics
      await prisma.agentMetrics.update({
        where: { id: existingMetrics.id },
        data: {
          totalRequests: { increment: 1 },
          successRate: success ? 
            (existingMetrics.successRate * existingMetrics.totalRequests + 1) / (existingMetrics.totalRequests + 1) :
            existingMetrics.successRate * existingMetrics.totalRequests / (existingMetrics.totalRequests + 1),
          errorRate: success ?
            existingMetrics.errorRate * existingMetrics.totalRequests / (existingMetrics.totalRequests + 1) :
            (existingMetrics.errorRate * existingMetrics.totalRequests + 1) / (existingMetrics.totalRequests + 1),
          averageResponseTime: 
            (existingMetrics.averageResponseTime * existingMetrics.totalRequests + executionTime) / (existingMetrics.totalRequests + 1),
          lastUpdated: new Date(),
        },
      });
    } else {
      // Create new metrics
      await prisma.agentMetrics.create({
        data: {
          deploymentId,
          totalRequests: 1,
          successRate: success ? 1 : 0,
          errorRate: success ? 0 : 1,
          averageResponseTime: executionTime,
          responseTime: executionTime,
          requestsPerMinute: 1,
          activeUsers: 1,
          averageTokensUsed: 0,
          costPerRequest: 0,
          totalCost: 0,
          lastUpdated: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error updating execution metrics:', error);
  }
} 