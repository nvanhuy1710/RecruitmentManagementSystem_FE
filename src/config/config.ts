export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout'
    },
    USER: {
      PROFILE: '/api/user/profile',
      UPDATE_PROFILE: '/api/user/profile/update'
    },
    JOB: {
      LIST: '/api/jobs',
      DETAIL: '/api/jobs/:id',
      CREATE: '/api/jobs/create',
      UPDATE: '/api/jobs/:id/update',
      DELETE: '/api/jobs/:id/delete'
    }
  }
}; 