import axios from 'axios';
import { API_CONFIG } from '../config/config';
import { ppid } from 'process';

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
  address: string;
  location: string;
  company: string;
  fromSalary: number;
  toSalary: number;
  dueDate: string;
  industryId: number;
  jobLevelId: number;
  workingModelId: number;
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
  },

  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/public/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
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

  createJob: async (article: JobArticle, image?: File) => {
    try {
      const formData = new FormData();

      // Đảm bảo dueDate là instant format với giờ 00:00:00
      const articleData = {
        ...article,
        dueDate: new Date(article.dueDate.split('T')[0] + 'T00:00:00.000Z').toISOString()
      };

      const articleBlob = new Blob([JSON.stringify(articleData)], {
        type: 'application/json'
      });

      formData.append('article', articleBlob, 'article.json');

      if (image) {
        formData.append('image', image);
      }

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.JOB.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

  getMyArticles: async (page: number, size: number) => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/articles`, {
        params: { page, size, sort: 'id,desc' },
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
    return response;
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

export const getMyApplicants = async (page: number, size: number) => {
  try {
    const response = await apiClient.get('/api/my-applicants', {
      params: { page, size, sort: 'id,desc' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching applicants:', error);
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

export default jobService; 