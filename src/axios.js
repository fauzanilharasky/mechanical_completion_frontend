import axios from 'axios';
import Cookies from 'js-cookie';
import { clientPlatformHeaders } from './clientPlatformHeaders';

const windowsHeader = await clientPlatformHeaders();
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PORTAL_LOCAL,
  headers: {
    'Content-Type': 'application/json',
    ...windowsHeader,
  },
  timeout: 10_000,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear all cookies
      const cookies = Cookies.get();
      Object.keys(cookies).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (error.response && error.response.status === 429) {
      if (typeof window !== 'undefined') {
        window.location.href = '/pcms-portal/too-many-requests';
      }
    }

    return Promise.reject(error);
  },
);
export default api;