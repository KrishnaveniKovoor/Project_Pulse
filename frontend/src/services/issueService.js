import api from './api';

export const issueService = {
  getIssues: (params = {}) => api.get('/issues', { params }),
  getIssue: (id) => api.get(`/issues/${id}`),
  createIssue: (data) => api.post('/issues', data),
  updateIssue: (id, data) => api.put(`/issues/${id}`, data),
  deleteIssue: (id) => api.delete(`/issues/${id}`),
  assignIssue: (id, assigneeId) => api.put(`/issues/${id}/assign`, { assignee: assigneeId, assigneeId }),
};
