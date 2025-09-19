import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

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
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          const nextConfig = config as RetryableRequestConfig;
          nextConfig.headers = nextConfig.headers ?? {};
          nextConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Log API requests
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        if (config.data && config.method !== 'get') {
          console.log('📤 Request data:', config.data);
        }

        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses
        console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        // Log error responses
        console.error(`❌ API Error: ${error.response?.status || 'No response'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        if (error.response?.data) {
          console.error('📥 Error data:', error.response.data);
        }
        const config = error.config as RetryableRequestConfig | undefined;
        if (!config) {
          return Promise.reject(error);
        }

        const requestUrl = config.url ?? "";
        const isAuthEndpoint =
          requestUrl.includes("/api/auth/refresh") ||
          requestUrl.includes("/api/auth/login") ||
          requestUrl.includes("/api/auth/verify");

        if (isAuthEndpoint) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !config._retry) {
          if (this.isRefreshing) {
            return new Promise<string>((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
                return this.client(config);
              })
              .catch((queueError) => Promise.reject(queueError));
          }

          config._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await this.client.post<RefreshResponse>("/api/auth/refresh", {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token: newRefreshToken } = response.data;

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", newRefreshToken);

            this.failedQueue.forEach(({ resolve }) => resolve(access_token));
            this.failedQueue = [];

            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${access_token}`;
            return this.client(config);
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

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
