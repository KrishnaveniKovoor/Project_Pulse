import api from './api';

export const userService = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  getUserActivity: (id) => api.get(`/users/${id}/activity`),
  // Profile-specific helpers (matches backend /api/auth/profile and /api/auth/password)
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', { oldPassword: data.currentPassword, newPassword: data.newPassword }),
  searchUsers: (query) => api.get('/users', { params: { search: query } }),
};
