import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (username: string, email: string, password: string, displayName: string) =>
    apiClient.post('/auth/register', { username, email, password, displayName }),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

// Songs API
export const songsAPI = {
  getSongs: (query?: string, page = 1, pageSize = 20) =>
    apiClient.get('/songs', { params: { query, page, pageSize } }),

  getSongById: (id: string) =>
    apiClient.get(`/songs/${id}`),
};

// Artists API
export const artistsAPI = {
  getArtists: (query?: string, page = 1, pageSize = 20) =>
    apiClient.get('/artists', { params: { query, page, pageSize } }),

  getArtistById: (id: string) =>
    apiClient.get(`/artists/${id}`),

  getArtistSongs: (id: string, page = 1, pageSize = 20) =>
    apiClient.get(`/artists/${id}/songs`, { params: { page, pageSize } }),
};

// Playlists API
export const playlistsAPI = {
  getPlaylists: () =>
    apiClient.get('/playlists'),

  createPlaylist: (title: string, description?: string) =>
    apiClient.post('/playlists', { title, description }),

  getPlaylistDetail: (id: string) =>
    apiClient.get(`/playlists/${id}`),

  addTrack: (playlistId: string, mediaItemId: string) =>
    apiClient.post(`/playlists/${playlistId}/tracks/${mediaItemId}`),

  removeTrack: (playlistId: string, mediaItemId: string) =>
    apiClient.delete(`/playlists/${playlistId}/tracks/${mediaItemId}`),
};

export default apiClient;
