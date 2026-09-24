import api from './api';

export const sprintService = {
  getSprints: (projectId) => {
    if (!projectId) return api.get('/sprints');
    const params = typeof projectId === 'object' ? projectId : { project: projectId, projectId };
    return api.get('/sprints', { params });
  },
  getSprint: (id) => api.get(`/sprints/${id}`),
  createSprint: (data) => api.post('/sprints', data),
  updateSprint: (id, data) => api.put(`/sprints/${id}`, data),
  deleteSprint: (id) => api.delete(`/sprints/${id}`),
  startSprint: (id) => api.put(`/sprints/${id}/start`),
  completeSprint: (id) => api.put(`/sprints/${id}/complete`),
  addTask: (sprintId, taskId) => api.post(`/sprints/${sprintId}/tasks`, { taskId }),
  removeTask: (sprintId, taskId) => api.delete(`/sprints/${sprintId}/tasks/${taskId}`),
};
