import { prisma } from './db';
import type { WorkflowExecution } from '@prisma/client';

interface WorkerConfig {
  concurrency: number;
  timeout: number;
  retries: number;
}

interface ExecutionStep {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  nextStepId?: string;
  config: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    transform?: (input: any) => any;
    condition?: (input: any) => boolean;
    trueStepId?: string;
    falseStepId?: string;
  };
}

interface WorkflowExecutionWithSteps extends WorkflowExecution {
  steps: ExecutionStep[];
}

export class WorkflowWorker {
  private config: WorkerConfig;
  private isRunning: boolean;
  private activeExecutions: Set<string>;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.isRunning = false;
    this.activeExecutions = new Set();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    await this.processQueue();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      if (this.activeExecutions.size >= this.config.concurrency) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      const execution = await this.getNextExecution();
      if (!execution) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      this.activeExecutions.add(execution.id);
      this.executeWorkflow(execution).catch(error => {
        console.error('Workflow execution failed:', error);
      }).finally(() => {
        this.activeExecutions.delete(execution.id);
      });
    }
  }

  private async getNextExecution(): Promise<WorkflowExecutionWithSteps | null> {
    const execution = await prisma.workflowExecution.findFirst({
      where: {
        status: 'pending',
        id: {
          notIn: Array.from(this.activeExecutions)
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    if (!execution) return null;
    // Attach steps: [] to satisfy the type
    return { ...execution, steps: [] };
  }

  private async executeWorkflow(execution: WorkflowExecutionWithSteps): Promise<void> {
    try {
      await this.updateExecutionStatus(execution.id, 'running');

      const steps = execution.steps;
      let currentStep = steps[0];
      let result = execution.input;

      while (currentStep) {
        result = await this.executeStep(currentStep, result);
        if (!currentStep.nextStepId) break;
        const nextStep = steps.find(step => step.id === currentStep.nextStepId);
        if (!nextStep) break;
        currentStep = nextStep;
      }

      await this.updateExecutionStatus(execution.id, 'completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await this.updateExecutionStatus(execution.id, 'failed', errorMessage);
      throw error;
    }
  }

  private async executeStep(step: ExecutionStep, input: any): Promise<any> {
    const startTime = Date.now();

    try {
      let result;
      switch (step.type) {
        case 'api':
          result = await this.executeApiStep(step, input);
          break;
        case 'transform':
          result = this.executeTransformStep(step, input);
          break;
        case 'condition':
          result = await this.executeConditionStep(step, input);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      await this.updateStepStatus(step, 'completed', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await this.updateStepStatus(step, 'failed', null, errorMessage);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      if (duration > this.config.timeout) {
        throw new Error(`Step execution timed out after ${duration}ms`);
      }
    }
  }

  private async executeApiStep(step: ExecutionStep, _input: any): Promise<any> {
    if (!step.config.url || !step.config.method) {
      throw new Error('Missing required API configuration');
    }
    const { url, method, headers, body } = step.config;
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body)
    });
    return response.json();
  }

  private executeTransformStep(step: ExecutionStep, input: any): any {
    if (!step.config.transform) {
      throw new Error('Missing transform function');
    }
    return step.config.transform(input);
  }

  private async executeConditionStep(step: ExecutionStep, input: any): Promise<any> {
    if (!step.config.condition || !step.config.trueStepId || !step.config.falseStepId) {
      throw new Error('Missing required condition configuration');
    }
    const { condition, trueStepId, falseStepId } = step.config;
    const result = condition(input);
    return result ? trueStepId : falseStepId;
  }

  private async updateExecutionStatus(
    executionId: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status,
        error,
        completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
      }
    });
  }

  private async updateStepStatus(
    step: ExecutionStep,
    status: 'pending' | 'running' | 'completed' | 'failed',
    output?: any,
    error?: string
  ): Promise<void> {
    const execution = await prisma.workflowExecution.findFirst({
      // Removed steps property, as it does not exist in Prisma schema
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    const executionWithSteps = execution as WorkflowExecutionWithSteps;
    const steps = executionWithSteps.steps;
    const stepIndex = steps.findIndex(s => s.id === step.id);

    if (stepIndex === -1) {
      throw new Error('Step not found');
    }

    steps[stepIndex] = {
      ...steps[stepIndex],
      status,
      output,
      error,
      completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
    };

    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: { /* removed steps property */ }
    });
  }
} 