import api from './api';

export const reportService = {
  getProjectReport: (projectId) => api.get(`/reports/project/${projectId}`),
  getWorkloadReport: () => api.get('/reports/workload'),
  getOverviewReport: () => api.get('/reports/overview'),
  getOverdueReport: () => api.get('/reports/overdue'),
  getSprintReport: (sprintId) => api.get(`/reports/sprint/${sprintId}`),
};
