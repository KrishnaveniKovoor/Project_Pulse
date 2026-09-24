import api from './api';

export const taskService = {
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getKanbanTasks: (projectId) => api.get('/tasks/kanban', { params: typeof projectId === 'object' ? projectId : { project: projectId, projectId } }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateTaskStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignTask: (id, assigneeId) => api.put(`/tasks/${id}/assign`, { assignee: assigneeId, assigneeId }),
};
