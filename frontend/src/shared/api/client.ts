import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/constants';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

// Get token from localStorage (zustand persist)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('ecx-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        const apiError: ApiError = {
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.error?.message || error.message || 'An unknown error occurred',
          status: error.response?.status || 500,
        };

        // Handle session expired
        if (apiError.code === 'SESSION_EXPIRED' || apiError.code === 'UNAUTHORIZED') {
          if (typeof window !== 'undefined') {
            // Clear auth storage
            localStorage.removeItem('ecx-auth');
            // Redirect to login if not already there
            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  // For downloading files (Excel/JSON export)
  async download(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    const token = getAuthToken();
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
      headers: {
        ...config?.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
