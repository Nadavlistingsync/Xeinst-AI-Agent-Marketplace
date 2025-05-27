interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
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
      throw new Error(data.error || 'An error occurred');
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function postApi<T>(
  endpoint: string,
  body: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

export async function putApi<T>(
  endpoint: string,
  body: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
}

export async function deleteApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
} 