import axios from 'axios';

// Cấu hình URL của Backend (Thay đổi theo địa chỉ API của nhóm bạn)
const API_BASE_URL = 'https://localhost:7001/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động thêm Token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Hoặc lấy từ cookie/context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý lỗi (ví dụ: token hết hạn hoặc lỗi server)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi chưa đăng nhập hoặc token hết hạn
      console.error("Unauthorized! Redirecting to login...");
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Các hàm gọi API (Ví dụ mẫu)
export const mediaService = {
  getPlaylists: () => apiClient.get('/playlists'),
  getTrackById: (id: string) => apiClient.get(`/tracks/${id}`),
  searchMedia: (query: string) => apiClient.get(`/search?q=${query}`),
  // Bạn có thể thêm các phương thức khác tại đây
};

export default apiClient;