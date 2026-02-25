// utils/AxiosInstance.js
import axios from "axios";


const isDevelopment = import.meta.env.MODE === 'development' 
const baseUrl = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_PROD


const AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, 
});

AxiosInstance.interceptors.request.use((config) => {
  let trialId = localStorage.getItem("trial_id");
  if (!trialId) {
    trialId = crypto.randomUUID();
    localStorage.setItem("trial_id", trialId);
  }
  config.headers["X-Trial-Id"] = trialId;

  const token = localStorage.getItem("Token");
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

    if (status === 401) {
      localStorage.removeItem("Token");
      localStorage.removeItem("TokenExpiry");
    }
    if (status >= 500) {
      window.location.href = "/500";
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
