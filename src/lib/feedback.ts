import { toast } from 'react-hot-toast';

interface FeedbackData {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details?: any;
  timestamp?: string;
}

class FeedbackSystem {
  private static instance: FeedbackSystem;
  private feedbackQueue: FeedbackData[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    this.setupErrorHandling();
  }

  public static getInstance(): FeedbackSystem {
    if (!FeedbackSystem.instance) {
      FeedbackSystem.instance = new FeedbackSystem();
    }
    return FeedbackSystem.instance;
  }

  private setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.log({
        type: 'error',
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log({
        type: 'error',
        message: 'Unhandled Promise Rejection',
        details: event.reason,
      });
    });
  }

  public async log(data: FeedbackData) {
    const feedbackData = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.feedbackQueue.push(feedbackData);
    this.showToast(feedbackData);

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private showToast(data: FeedbackData) {
    const toastOptions = {
      duration: 4000,
      position: 'bottom-right' as const,
    };

    switch (data.type) {
      case 'error':
        toast.error(data.message, toastOptions);
        break;
      case 'warning':
        toast(data.message, { ...toastOptions, icon: '⚠️' });
        break;
      case 'success':
        toast.success(data.message, toastOptions);
        break;
      default:
        toast(data.message, toastOptions);
    }
  }

  private async processQueue() {
    if (this.feedbackQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const feedback = this.feedbackQueue.shift();

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }

    await this.processQueue();
  }
}

export const feedback = FeedbackSystem.getInstance(); 