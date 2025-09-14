// Database connection check utility
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDatabaseErrorMessage(): string {
  return "Database not configured. Please set up DATABASE_URL environment variable.";
}

export function createDatabaseErrorResponse() {
  return {
    success: false,
    error: "Database not available",
    message: getDatabaseErrorMessage(),
    timestamp: new Date().toISOString()
  };
}
