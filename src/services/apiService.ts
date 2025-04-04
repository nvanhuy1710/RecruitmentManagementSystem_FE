import axios from 'axios';
import { API_CONFIG } from '../config/config';

interface LoginResponse {
  expiredIn: number;
  accessToken: string;
  refreshToken: string;
}

interface UserInfo {
  username: string;
  email?: string;
  fullName?: string;
}

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await apiClient.post('/api/auth/refresh-token', {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        username,
        password
      });

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Get user info after successful login
      const userInfo = await authService.getUserInfo();
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status !== 200) {
        throw new Error('Invalid username or password');
      }
      throw error;
    }
  },

  getUserInfo: async (): Promise<UserInfo> => {
    const response = await apiClient.get<UserInfo>('/api/account');
    return response.data;
  },

  register: async (userData: {
    email: string;
    fullName: string;
    username: string;
    password: string;
    gender: string;
    birth: string;
  }) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  }
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, profileData);
    return response.data;
  }
};

// Job services
export const jobService = {
  getJobs: async (params?: any) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.JOB.LIST, { params });
    return response.data;
  },

  getJobDetail: async (id: string) => {
    const url = API_CONFIG.ENDPOINTS.JOB.DETAIL.replace(':id', id);
    const response = await apiClient.get(url);
    return response.data;
  },

  createJob: async (jobData: any) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.JOB.CREATE, jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: any) => {
    const url = API_CONFIG.ENDPOINTS.JOB.UPDATE.replace(':id', id);
    const response = await apiClient.put(url, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const url = API_CONFIG.ENDPOINTS.JOB.DELETE.replace(':id', id);
    const response = await apiClient.delete(url);
    return response.data;
  }
}; 