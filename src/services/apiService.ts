import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { ppid } from 'process';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Frame, Message } from '@stomp/stompjs';

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

interface JobArticle {
  title: string;
  content: string;
  requirement: string;
  location: string;
  fromSalary: number;
  toSalary: number;
  dueDate: string;
  industryIds: number[];
  jobLevelIds: number[];
  workingModelIds: number[];
  companyId: number;
}

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// List of URLs that don't require authentication
const publicUrls = [
  '/api/auth/login',
  '/api/register',
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
    const setCookie = response.headers['set-cookie'] as string[] | string | undefined;
    if (setCookie) {
      let jsessionid: string | undefined;
      
      if (Array.isArray(setCookie)) {
        const jsessionidCookie = setCookie.find(cookie => cookie.startsWith('JSESSIONID='));
        if (jsessionidCookie) {
          jsessionid = jsessionidCookie.split(';')[0].split('=')[1];
        }
      } else if (typeof setCookie === 'string') {
        const cookies = setCookie.split(',').map((c: string) => c.trim());
        const jsessionidCookie = cookies.find((cookie: string) => cookie.startsWith('JSESSIONID='));
        if (jsessionidCookie) {
          jsessionid = jsessionidCookie.split(';')[0].split('=')[1];
        }
      }

      if (jsessionid) {
        localStorage.setItem('JSESSIONID', jsessionid);
      }
    }
    return response;
  },
  async (error) => {
    console.error('Response error:', error);
    
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
      
      // Get JSESSIONID from response headers
      const allHeaders = response.headers;
      
      // Try to get Set-Cookie header
      const setCookie = allHeaders['set-cookie'] as string[] | string | undefined;
      
      if (setCookie) {
        let jsessionid: string | undefined;
        if (Array.isArray(setCookie)) {
          const jsessionidCookie = setCookie.find(cookie => cookie.startsWith('JSESSIONID='));
          if (jsessionidCookie) {
            jsessionid = jsessionidCookie.split(';')[0].split('=')[1];
          }
        } else if (typeof setCookie === 'string') {
          const cookies = setCookie.split(',').map(c => c.trim());
          const jsessionidCookie = cookies.find(cookie => cookie.startsWith('JSESSIONID='));
          if (jsessionidCookie) {
            jsessionid = jsessionidCookie.split(';')[0].split('=')[1];
          }
        }

        if (jsessionid) {
          localStorage.setItem('JSESSIONID', jsessionid);
        }
      }

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

  forgotPassword: async (username: string): Promise<boolean> => {
    try {
      const response = await apiClient.put(`/api/forgot-password/${username}`);
      return response.status === 204;
    } catch (error) {
      throw error;
    }
  },

  getUserInfo: async () => {
    try {
      const response = await apiClient.get('/api/account');
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  },

  updateUserInfo: async (userData: UpdateUserPayload): Promise<UserInfo> => {
    try {    
      const response = await apiClient.put<UserInfo>('/api/account', userData);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      return response.data;
    }catch(error : any) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
      return error;
    }
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

  logout: async () => {
    try {
      const jsessionid = localStorage.getItem('JSESSIONID');
      // Gọi API logout với session id
      await apiClient.post('/api/auth/logout', null, {
        headers: {
          Cookie: `JSESSIONID=${jsessionid}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa tất cả thông tin user trên storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('JSESSIONID');
      
      // Redirect về trang login
      window.location.href = '/login';
    }
  },

  getNotifications: async (page: number = 0, size: number = 2) => {
    try {
      const response = await apiClient.get('/api/account/notifications', {
        params: {
          page,
          size,
          sort: 'id,desc'
        }
      });
      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0', 10)
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getUnviewedNotificationCount: async () => {
    try {
      const response = await apiClient.get('/api/account/notifications/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unviewed notification count:', error);
      return 0;
    }
  },

  updateNotificationViewed: async (notificationId: number) => {
    try {
      const response = await apiClient.put(`/api/notifications/${notificationId}/update-viewed`);
      return response;
    } catch (error) {
      console.error('Error updating notification viewed status:', error);
      throw error;
    }
  },
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
  },

  getAllUsers: async (params?: Record<string, string>) => {
    try {
      const response = await apiClient.get('/public/api/users', { 
        params: {
          ...params,
          sort: 'id,desc'
        }
      });
      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0', 10)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getAllEmployees: async () => {
    try {
      const response = await apiClient.get('/users/employee/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  updateUserRole: async (userId: number, roleName: string) => {
    try {
      const response = await apiClient.put(`/api/users/${userId}/role`, {
        roleName
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  lockUser: async (userId: number) => {
    try {
      const response = await apiClient.put(`/api/users/${userId}/lock`);
      return response.data;
    } catch (error) {
      console.error('Error locking user:', error);
      throw error;
    }
  },

  unlockUser: async (userId: number) => {
    try {
      const response = await apiClient.put(`/api/users/${userId}/unlock`);
      return response.data;
    } catch (error) {
      console.error('Error unlocking user:', error);
      throw error;
    }
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

  getIndustries: async () => {
    const response = await apiClient.get('/api/industries/all');
    return response.data;
  },

  getJobLevels: async () => {
    const response = await apiClient.get('/api/job-levels/all');
    return response.data;
  },

  getWorkingModels: async () => {
    const response = await apiClient.get('/api/working-models/all');
    return response.data;
  },

  getSkills: async () => {
    const response = await apiClient.get('/api/skills/all');
    return response.data;
  },

  getCompanies: async () => {
    try {
      const response = await apiClient.get('/public/api/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  createJob: async (article: JobArticle, image?: File) => {
    try {
      console.log('Creating job with data:', article);
      const formData = new FormData();

      // Đảm bảo dueDate là instant format với giờ 00:00:00
      const articleData = {
        ...article,
        dueDate: new Date(article.dueDate.split('T')[0] + 'T00:00:00.000Z').toISOString()
      };

      console.log('Formatted article data:', articleData);

      const articleBlob = new Blob([JSON.stringify(articleData)], {
        type: 'application/json'
      });

      formData.append('article', articleBlob, 'article.json');

      if (image) {
        formData.append('image', image);
      }

      console.log('Sending request to:', API_CONFIG.ENDPOINTS.JOB.CREATE);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.JOB.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API response:', response);

      // Kiểm tra status code
      if (response.status === 201) {
        return {
          success: true,
          message: 'Post Article Successful'
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('Create job error:', error);
      throw error;
    }
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
  },

  getMyArticles: async (page: number, size: number, params?: any) => {
    try {
      const queryParams = {
        page,
        size,
        sort: 'id,desc',
        ...params
      };

      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/articles`, {
        params: queryParams,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAllMyArticles: async (status?: string) => {
    try {
      const params: any = {};
      if (status) {
        params['status.equals'] = status;
      }
      const response = await apiClient.get(`${API_CONFIG.BASE_URL}/api/articles`, {
        params: params,
        withCredentials: true
      });
      return response;
    } catch (error) {
      throw error;
    }
  },


  getArticleById: async (id: number) => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/public/api/articles/${id}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateArticle: async (id: number, data: any) => {
    try {
      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/articles/${id}`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateArticleImage: async (id: number, image: File) => {
    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await axios.put(`${API_CONFIG.BASE_URL}/api/articles/${id}/update-image`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getPendingArticles: async (page: number, size: number) => {
    const response = await apiClient.get(`${API_CONFIG.BASE_URL}/api/admin-articles/pending-approve`, {
      params: {
        page,
        size,
        sort: 'id,desc'
      },
      withCredentials: true
    });
    return {
      data: response.data,
      total: parseInt(response.headers['x-total-count'] || '0', 10)
    };
  },

  approveArticle: async (id: number) => {
    const response = await apiClient.put(`${API_CONFIG.BASE_URL}/api/admin-articles/${id}/approve`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  rejectArticle: async (id: number) => {
    const response = await apiClient.put(`${API_CONFIG.BASE_URL}/api/admin-articles/${id}/reject`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  getPublicArticles: async (params?: any) => {
    return apiClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOB.PUBLIC_ARTICLES}`, {
      params
    });
  },

  getApplicantCountByDate: async (year: number) => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/count/applicant-date/${year}`, {
      headers: { Accept: 'application/json, text/plain, */*' },
      withCredentials: true
    });
    console.log('API applicantRes:', response.data);
    return response.data;
  },

  getArticleCountByDate: async (year: number) => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/count/article-date/${year}`, {
      headers: { Accept: 'application/json, text/plain, */*' },
      withCredentials: true
    });
    console.log('API articleRes:', response.data);
    return response.data;
  },

  getArticleCountByCompany: async (year: number) => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/count/article-company/${year}`, {
      headers: { Accept: 'application/json, text/plain, */*' },
      withCredentials: true
    });
    console.log('API companyRes:', response.data);
    return response.data;
  },

  closeArticle: async (id: number) => {
    try {
      const response = await apiClient.put(`/api/articles/${id}/close`);
      return response.data;
    } catch (error) {
      console.error('Error closing article:', error);
      throw error;
    }
  },

  getPublicCompanies: async (params?: Record<string, string>) => {
    try {
      const response = await apiClient.get('/public/api/companies', { 
        params: {
          ...params,
          sort: 'id,desc'
        }
      });
      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0', 10)
      };
    } catch (error) {
      console.error('Error fetching public companies:', error);
      throw error;
    }
  },
};

export const checkAuth = async () => {
  try {
    const response = await apiClient.get('/api/account');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const applicantService = {
  createApplicant: async (formData: FormData) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/applicants`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
      throw error;
    }
  },

  approveApplication: async (id: number) => {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/api/applicants/${id}/accept`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  declineApplication: async (id: number) => {
    const response = await axios.put(`${API_CONFIG.BASE_URL}/api/applicants/${id}/decline`, {}, {
      withCredentials: true
    });
    return response.data;
  },

  calculateMatchScore: async (articleId: number) => {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/applicants/${articleId}/match-score`, {
      withCredentials: true
    });
    return response.data;
  },
};

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  DECLINED = 'DECLINED',
  ACCEPTED = 'ACCEPTED'
}

export const getApplicants = async (params: any, status?: ApplicationStatus) => {
  try {
    const queryParams = { ...params };
    if (status) {
      queryParams['status.equals'] = status;
    }
    const response = await apiClient.get('/api/applicants', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching applicants:', error);
    throw error;
  }
};

export const getMyApplicants = async (page: number, size: number, status?: string | null) => {
  try {
    const params: any = {
      page,
      size,
      sort: 'id,desc'
    };
    
    if (status) {
      params['status.equals'] = status;
    }

    const response = await apiClient.get('/api/my-applicants', {
      params,
      withCredentials: true
    });
    return {
      data: response.data,
      total: parseInt(response.headers['x-total-count'] || '0', 10)
    };
  } catch (error) {
    console.error('Error fetching my applications:', error);
    throw error;
  }
};

export const getApplicationById = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/applicants/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error;
  }
};

export const companyService = {
  getCompanies: async (params?: Record<string, string>) => {
    try {
      const response = await apiClient.get('/api/companies', { 
        params: {
          ...params,
          sort: 'id,desc'
        }
      });
      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0', 10)
      };
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  getPublicCompanies: async (params?: Record<string, string>) => {
    try {
      const response = await apiClient.get('/public/api/companies', { 
        params: {
          ...params,
          sort: 'id,desc'
        }
      });
      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0', 10)
      };
    } catch (error) {
      console.error('Error fetching public companies:', error);
      throw error;
    }
  },

  createCompany: async (companyData: any) => {
    try {
      const response = await apiClient.post('/api/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  updateCompany: async (id: number, companyData: any) => {
    try {
      const response = await apiClient.put(`/api/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  disableCompany: async (id: number) => {
    try {
      const response = await apiClient.put(`/api/companies/${id}/disable`);
      return response.data;
    } catch (error) {
      console.error('Error disabling company:', error);
      throw error;
    }
  },

  enableCompany: async (id: number) => {
    try {
      const response = await apiClient.put(`/api/companies/${id}/enable`);
      return response.data;
    } catch (error) {
      console.error('Error enabling company:', error);
      throw error;
    }
  },

  updateCompanyImage: async (id: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.put(`/api/companies/${id}/update-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating company image:', error);
      throw error;
    }
  },

  followCompany: async (companyId: number) => {
    try {
      const response = await apiClient.put(`/api/account/follow-company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error following company:', error);
      throw error;
    }
  },

  unfollowCompany: async (companyId: number) => {
    try {
      const response = await apiClient.put(`/api/account/unfollow-company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error unfollowing company:', error);
      throw error;
    }
  },

  getFollowedCompanies: async () => {
    try {
      const response = await apiClient.get('/api/account/followed-companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching followed companies:', error);
      throw error;
    }
  },
};

export const connectNotificationWebSocket = (userId: number, onMessage: (notification: any) => void) => {
  const socket = new SockJS(`${API_CONFIG.BASE_URL}/websocket/recruit`);
  const stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str: string) => {
      console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = () => {
    console.log('Connected to WebSocket');
    stompClient.subscribe(`/topic/notification-${userId}`, (message: Message) => {
      const notification = JSON.parse(message.body);
      onMessage(notification);
    });
  };

  stompClient.onStompError = (frame: Frame) => {
    console.error('Broker reported error:', frame.headers['message']);
    console.error('Additional details:', frame.body);
  };

  stompClient.activate();
  return stompClient;
};

export default jobService; 