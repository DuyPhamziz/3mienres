import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

// Khởi tạo instance axios trỏ tới backend
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor thêm access token vào header trước mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor xử lý 401: tự động dùng refresh token cấp lại access token rồi retry
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        // Dùng axios gốc để tránh vòng lặp interceptor
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefreshToken, data } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
