// Simple error logging without Sentry
export function initSentry() {
  // No-op for now
}

export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error, context);
}

export function captureMessage(message: string, level: string = 'info') {
  console.log(`[${level.toUpperCase()}] ${message}`);
}

export function setUser(_user: { id: string; email?: string; username?: string } | null) {
  // No-op for now
}

export function setTag(_key: string, _value: string) {
  // No-op for now
}

export function setContext(_name: string, _context: Record<string, any>) {
  // No-op for now
} 