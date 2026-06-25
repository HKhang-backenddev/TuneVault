import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Sử dụng proxy từ vite.config.ts để tránh lỗi CORS
  timeout: 300000, // Tăng thời gian chờ lên 5 phút (300 giây) để kịp tải nhạc từ YouTube
});

// Tự động thêm Token vào Header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // CHỈ gửi header nếu có token THẬT (không phải chuỗi "null", "undefined" hoặc bypass)
  if (token && token !== "dev-token-bypass" && token !== "undefined" && token !== "null" && token.trim() !== "") {
    // DEBUG: In token ra console để kiểm tra xem nó có được gửi đúng không
    console.log("Axios Interceptor: Sending token:", token);
    config.headers = config.headers ?? {};
    // axios đôi khi tạo headers là Readonly; đảm bảo gán được
    (config.headers as any).Authorization = `Bearer ${token}`;
  } else {
    delete (config.headers as any)?.Authorization;
  }
  return config;
});

// Xử lý khi Token hết hạn (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi 401 và KHÔNG PHẢI đang thực hiện đăng nhập
    if (error.response?.status === 401 && !error.config.url?.includes('/Auth/login') && !error.config.url?.includes('negotiate')) {
      console.warn("Axios: Nhận lỗi 401 từ server.");
      // Không thực hiện redirect tại đây để tránh vòng lặp. 
      // App.tsx sẽ xử lý việc này thông qua fetchProfile hoặc route protection.
    }
    return Promise.reject(error);
  }
);

export default api;