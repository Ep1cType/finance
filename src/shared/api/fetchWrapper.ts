import { redirect } from "next/navigation";

/**
 * Configuration options for API requests
 */
export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
  requireAuth?: boolean;
}

/**
 * API Response type
 */
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

/**
 * Create a URL with query parameters
 */
const createUrl = (url: string, params?: Record<string, string>): string => {
  const urlObj = new URL(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${url}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });
  }

  return urlObj.toString();
};

/**
 * Fetch wrapper for making API requests with improved typing and error handling
 */
export const fetchWrapper = {
  /**
   * GET request
   */
  get: async <T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return request<T>(url, {
      method: "GET",
      ...options,
    });
  },

  /**
   * POST request
   */
  post: async <T>(url: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * PUT request
   */
  put: async <T>(url: string, body: any, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return request<T>(url, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * PATCH request
   */
  patch: async <T>(url: string, body: any, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * DELETE request
   */
  delete: async <T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> => {
    return request<T>(url, {
      method: "DELETE",
      ...options,
    });
  },
};

/**
 * Auth configuration
 */
export interface AuthConfig {
  isAuthTokenExpired: (response: Response) => Promise<boolean>;
  handleSessionExpired: () => void;
  getAuthHeaders: () => Record<string, string>;
}

// Default auth configuration - should be updated with actual implementation
let authConfig: AuthConfig = {
  isAuthTokenExpired: async (response) => {
    return response.status === 401;
  },
  handleSessionExpired: () => {},
  getAuthHeaders: () => ({}),
};

/**
 * Configure auth handlers
 */
export function configureAuth(config: Partial<AuthConfig>): void {
  authConfig = { ...authConfig, ...config };
}

/**
 * Main request function that handles all HTTP methods
 */
async function request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, timeout = 8000, requireAuth = true, ...fetchOptions } = options;

  // Set default headers if not provided
  let headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (requireAuth) {
    headers = {
      ...headers,
      ...authConfig.getAuthHeaders(),
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fullUrl = createUrl(url, params);

    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      credentials: requireAuth ? "include" : fetchOptions.credentials || "include",
    });

    clearTimeout(timeoutId);

    if (requireAuth && (await authConfig.isAuthTokenExpired(response))) {
      // Handle session expiration
      authConfig.handleSessionExpired();

      return {
        data: null,
        error: "Session expired. Please log in again.",
        status: 401,
      };
    }

    // Handle different response types
    let data = null;
    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      // Handle other response types or binary data if needed
      data = await response.blob();
    }

    // Handle API error responses
    if (!response.ok) {
      return {
        data: null,
        error: data?.message || `API Error: ${response.status} ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data: data as T,
      error: null,
      status: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    const isAborted = error instanceof DOMException && error.name === "AbortError";

    return {
      data: null,
      error: isAborted ? "Request timeout" : error instanceof Error ? error.message : "Unknown error",
      status: isAborted ? 408 : 500,
    };
  }
}
