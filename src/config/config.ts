export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/register',
      LOGOUT: '/api/auth/logout'
    },
    USER: {
      PROFILE: '/api/user/profile',
      UPDATE_PROFILE: '/api/user/profile/update'
    },
    JOB: {
      LIST: '/api/jobs',
      DETAIL: '/api/jobs',
      CREATE: '/api/articles',
      MY_ARTICLES: '/api/articles',
      UPDATE: '/api/articles',
      DELETE: '/api/articles',
      PUBLIC_ARTICLES: '/public/api/articles'
    }
  }
}; 