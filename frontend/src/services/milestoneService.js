import api from './api';

export const milestoneService = {
  getMilestones: (projectId) => {
    if (!projectId) return api.get('/milestones');
    const params = typeof projectId === 'object' ? projectId : { project: projectId, projectId };
    return api.get('/milestones', { params });
  },
  getMilestone: (id) => api.get(`/milestones/${id}`),
  createMilestone: (data) => api.post('/milestones', data),
  updateMilestone: (id, data) => api.put(`/milestones/${id}`, data),
  deleteMilestone: (id) => api.delete(`/milestones/${id}`),
};
