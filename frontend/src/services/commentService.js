import api from './api';

export const commentService = {
  getComments: (params = {}) => api.get('/comments', { params }),
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};
