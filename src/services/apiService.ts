import axios from 'axios';
import { API_CONFIG } from '../config/config';

interface LoginResponse {
  expiredIn: number;
  accessToken: string;
  refreshToken: string;
}

interface UserInfo {
  username: string;
  email: string;
  fullName: string;
  gender: boolean;
  birth: string;
  avatarUrl?: string;
}

interface UpdateUserPayload {
  email: string;
  fullName: string;
  username: string;
  birth: string;
  gender: boolean;
}

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// List of URLs that don't require authentication
const publicUrls = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token'
];

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Don't add token for public URLs
    if (config.url && !publicUrls.some(url => config.url?.includes(url))) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add JSESSIONID to Cookie header if exists
    const jsessionid = localStorage.getItem('JSESSIONID');
    if (jsessionid) {
      config.headers.Cookie = `JSESSIONID=${jsessionid}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Extract JSESSIONID from Set-Cookie header if present
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const jsessionidMatch = setCookie.find(cookie => cookie.startsWith('JSESSIONID='));
      if (jsessionidMatch) {
        const jsessionid = jsessionidMatch.split(';')[0].split('=')[1];
        localStorage.setItem('JSESSIONID', jsessionid);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await apiClient.post('/api/auth/refresh-token', {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('JSESSIONID');
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

      console.log('Login response headers:', response.headers);
      
      // Get JSESSIONID from response headers
      const allHeaders = response.headers;
      console.log('All headers:', allHeaders);
      
      // Try to get Set-Cookie header
      const setCookie = allHeaders['set-cookie'] as string[] | string | undefined;
      console.log('Set-Cookie header:', setCookie);
      
      if (setCookie) {
        let jsessionid: string | undefined;
        if (Array.isArray(setCookie)) {
          // If set-cookie is an array
          const jsessionidCookie = setCookie.find(cookie => cookie.startsWith('JSESSIONID='));
          if (jsessionidCookie) {
            jsessionid = jsessionidCookie.split(';')[0].split('=')[1];
          }
        } else if (typeof setCookie === 'string') {
          // If set-cookie is a string
          const cookies = setCookie.split(',').map(c => c.trim());
          const jsessionidCookie = cookies.find(cookie => cookie.startsWith('JSESSIONID='));
          if (jsessionidCookie) {
            jsessionid = jsessionidCookie.split(';')[0].split('=')[1];
          }
        }

        if (jsessionid) {
          console.log('Found JSESSIONID:', jsessionid);
          localStorage.setItem('JSESSIONID', jsessionid);
        } else {
          console.log('No JSESSIONID found in cookies');
        }
      } else {
        console.log('No Set-Cookie header found');
      }

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Get user info after successful login
      const userInfo = await authService.getUserInfo();
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        console.log('Error response headers:', error.response.headers);
      }
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

  updateUserInfo: async (userData: UpdateUserPayload): Promise<UserInfo> => {
    const response = await apiClient.put<UserInfo>('/api/account', userData);
    localStorage.setItem('userInfo', JSON.stringify(response.data));
    return response.data;
  },

  updateAvatar: async (formData: FormData): Promise<void> => {
    await apiClient.post('/api/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    localStorage.removeItem('JSESSIONID');
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