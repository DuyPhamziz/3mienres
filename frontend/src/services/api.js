import axios from "axios";

// khởi tạo một instance của axios trỏ ới backend

const api = axios.create({
  baseURL: "http://localhost:3000/api", // URL của backend
  headers: {
    "Content-Type": "application/json",
  },
});
// interceptor để thêm token vào header của request trước khi gửi lên backend
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export default api;
