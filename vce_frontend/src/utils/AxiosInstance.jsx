// utils/AxiosInstance.js
import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, 
});


AxiosInstance.interceptors.request.use((config) => {
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
