import { Response } from 'node-fetch';

export async function getResponseBody(response: Response | any) {
  return typeof response.json === 'function' ? await response.json() : response;
}

export function createMockResponse(data: any, status = 200) {
  return {
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

export function createMockErrorResponse(error: Error, status = 500) {
  return {
    status,
    json: async () => ({
      name: error.name,
      message: error.message,
      details: error.stack,
    }),
    text: async () => JSON.stringify({
      name: error.name,
      message: error.message,
      details: error.stack,
    }),
  };
} 