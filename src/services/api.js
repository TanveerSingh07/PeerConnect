import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Only redirect if user is NOT already on login page
      if (currentPath !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('peerProfile');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// AUTH API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// USERS API
export const userAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadImage: (formData) => api.post('/users/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/users/stats'),
  getRecommendations: () => api.get('/users/recommendations'),
  deleteAccount: () => api.delete('/users/account')
};

// CONNECTIONS API
export const connectionAPI = {
  getAll: () => api.get('/connections'),
  getPending: () => api.get('/connections/pending'),
  getSent: () => api.get('/connections/sent'),
  getStatus: (userId) => api.get(`/connections/status/${userId}`),
  send: (recipientId) => api.post(`/connections/send/${recipientId}`),
  accept: (connectionId) => api.put(`/connections/accept/${connectionId}`),
  reject: (connectionId) => api.put(`/connections/reject/${connectionId}`),
  withdraw: (recipientId) => api.delete(`/connections/withdraw/${recipientId}`),
  remove: (userId) => api.delete(`/connections/remove/${userId}`)
};

// POSTS API
export const postAPI = {
  getAll: (params = {}) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.put(`/posts/${id}/like`),
  addComment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
  deleteComment: (id, commentId) => api.delete(`/posts/${id}/comment/${commentId}`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`)
};

// NOTIFICATIONS API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getCount: () => api.get('/notifications/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

// MESSAGES API - NEW
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getOrCreateConversation: (userId) => api.post('/messages/conversation', { userId }),
  getMessages: (conversationId, params = {}) => api.get(`/messages/${conversationId}`, { params }),
  sendMessage: (conversationId, text) => api.post(`/messages/${conversationId}`, { text }),
  markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`),
  getUnreadCount: () => api.get('/messages/unread/count')
};

export default api;