import api from './api';

export const attachmentService = {
  getAttachments: (params = {}) => api.get('/attachments', { params }),
  uploadAttachment: (formData) =>
    api.post('/attachments', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAttachment: (id) => api.delete(`/attachments/${id}`),
};
