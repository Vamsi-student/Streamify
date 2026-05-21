import axios from "axios"

const BASE_URL=import.meta.env.MODE === "development"?"http://localhost:3000/api":"/api";
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
      const isPublicAuth = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/verify-reset-otp", "/auth/reset-password"].some(p => originalRequest.url?.includes(p));
      if (isPublicAuth) {
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        const isPublicPath = ["/login", "/signup", "/forgot-password", "/reset-password"].some(p => window.location.pathname.startsWith(p));
        if (!isPublicPath) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;