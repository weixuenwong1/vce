// utils/AxiosInstance.js
import axios from "axios";
import { clearSession, getSessionToken } from './session';


const isDevelopment = import.meta.env.MODE === 'development' 
const baseUrl = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_PROD


const AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, 
});


AxiosInstance.interceptors.request.use((config) => {
  const sessionToken = getSessionToken();
  if (!sessionToken && localStorage.getItem('Token')) clearSession();
  const publicAuth = /^\/?(?:login|register|api\/password_reset(?:\/confirm|\/validate_token)?)\/?$/.test(config.url);
  const token = publicAuth ? null : sessionToken;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    const config = error.config;
    const sentToken = config?.headers?.Authorization;
    if (status === 401 && sentToken) {
      // A late response from an old session must not clear a newer login.
      if (sentToken === `Token ${localStorage.getItem('Token')}`) clearSession();
      const publicCatalogue = /^\/?api\/(?:chapters\/(?:[^/]+\/(?:topics\/)?)?|catalogue\/[^/]+\/?)$/.test(config.url);
      const publicPreview = /^\/?api\/(?:summary|problems)\/[^/]+\/[^/]+\/[^/]+\/?$/.test(config.url);
      if (config.method === 'get' && (publicCatalogue || publicPreview) && !config.sessionRetried) {
        config.sessionRetried = true;
        return AxiosInstance(config);
      }
    }
    if (status >= 500) {
      window.location.href = "/500";
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
