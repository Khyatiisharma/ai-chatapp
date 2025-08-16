import axios from "axios";

// ❌ dotenv ki zarurat nahi Vite project me
// dotenv sirf Node.js (backend) me use hota hai

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ Vite env variable
  withCredentials: true,
});

// ✅ Token ko har request ke liye dynamically lagane ke liye interceptor use karo
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
