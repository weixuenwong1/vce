import axios from 'axios'

const baseUrl = 'http://192.168.1.98:4173:8000/'

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    headers: {
        "Content-type": "application/json",
        accept: "application/json"
    }
})

AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("Token")

        if(token){
            config.headers.Authorization = `Token ${token}`
        }
        else{
            config.headers.Authorization = ``
        }
        return config;
    },
);

AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem('Token');
      localStorage.removeItem("TokenExpiry");
    }

    if (status >= 500) {
      window.location.href = '/500';
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance