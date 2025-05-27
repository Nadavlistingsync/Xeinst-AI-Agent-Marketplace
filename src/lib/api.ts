interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return { data };
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return fetchApi(endpoint, options, retries - 1);
    }
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function postApi<T>(
  endpoint: string,
  body: any,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  }, retries);
}

export async function putApi<T>(
  endpoint: string,
  body: any,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  }, retries);
}

export async function deleteApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'DELETE',
  }, retries);
} 