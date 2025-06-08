import { prisma } from './db';
import type { WorkflowExecution } from '@/types/prisma';

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

  private async getNextExecution(): Promise<WorkflowExecution | null> {
    return prisma.workflowExecution.findFirst({
      where: {
        status: 'pending',
        id: {
          notIn: Array.from(this.activeExecutions)
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  private async executeWorkflow(execution: WorkflowExecution): Promise<void> {
    try {
      await this.updateExecutionStatus(execution.id, 'running');

      const steps = execution.steps as ExecutionStep[];
      let currentStep = steps[0];
      let result = execution.input;

      while (currentStep) {
        result = await this.executeStep(currentStep, result);
        currentStep = steps.find(step => step.id === currentStep.nextStepId);
      }

      await this.updateExecutionStatus(execution.id, 'completed');
    } catch (error) {
      await this.updateExecutionStatus(execution.id, 'failed', error.message);
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
      await this.updateStepStatus(step, 'failed', null, error.message);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      if (duration > this.config.timeout) {
        throw new Error(`Step execution timed out after ${duration}ms`);
      }
    }
  }

  private async executeApiStep(step: ExecutionStep, input: any): Promise<any> {
    const { url, method, headers, body } = step.config;
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body)
    });
    return response.json();
  }

  private executeTransformStep(step: ExecutionStep, input: any): any {
    const { transform } = step.config;
    return transform(input);
  }

  private async executeConditionStep(step: ExecutionStep, input: any): Promise<any> {
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
      where: {
        steps: {
          some: {
            id: step.id
          }
        }
      }
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    const steps = execution.steps as ExecutionStep[];
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
      data: { steps }
    });
  }
} 