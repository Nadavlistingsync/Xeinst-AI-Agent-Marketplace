export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiErrorResponse = {
  error: string;
  details?: unknown;
  statusCode?: number;
}; 