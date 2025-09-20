import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getApiBaseUrl } from "./config";

type RequestHeaders = Record<string, string>;

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  headers?: RequestHeaders;
};

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    const apiBaseUrl = getApiBaseUrl();
    console.log(`🔧 API Client initialized with baseURL: ${apiBaseUrl}`);

    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // Cookie-only: no Authorization header; rely on withCredentials
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        if (config.data && config.method !== 'get') {
          console.log('Request data:', config.data);
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;
        const requestUrl = (config?.url ?? "");
        const isAuthEndpoint =
          requestUrl.includes("/api/auth/refresh") ||
          requestUrl.includes("/api/auth/login") ||
          requestUrl.includes("/api/auth/verify");

        // Suppress noisy logs for expected auth failures (e.g., no session yet)
        // Only log unexpected 5xx errors
        if (status && status >= 500) {
          console.error(`API Error: ${status} ${config?.method?.toUpperCase()} ${config?.url}`);
          if (error.response?.data) {
            console.error('Error data:', error.response.data);
          }
        }

        if (isAuthEndpoint) {
          return Promise.reject(error);
        }

        if (!config) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !config._retry) {
          if (this.isRefreshing) {
            return new Promise<string>((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(config))
              .catch((queueError) => Promise.reject(queueError));
          }

          config._retry = true;
          this.isRefreshing = true;

          try {
            // Cookie-only: call refresh with no body; backend reads cookie
            await this.client.post<RefreshResponse>("/api/auth/refresh");

            this.failedQueue.forEach(({ resolve }) => resolve(""));
            this.failedQueue = [];

            return this.client(config);
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];

            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
