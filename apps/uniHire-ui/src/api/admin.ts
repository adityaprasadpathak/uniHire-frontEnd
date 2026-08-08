import apiClient from '../services/apiClient';

export const adminApi = {
  getEmployers: async () => {
    const response = await apiClient.get(`/admin/employers`);
    return response.data;
  },

  getCandidates: async () => {
    const response = await apiClient.get(`/admin/candidates`);
    return response.data;
  },

  toggleUserLock: async (userId: number, reason: string) => {
    const response = await apiClient.put(`/admin/users/${userId}/lock`, { reason });
    return response.data;
  },

  verifyEmployer: async (employerId: number, status: string) => {
    const response = await apiClient.put(`/admin/employers/${employerId}/verify`, { status });
    return response.data;
  },

  verifyCandidate: async (candidateId: number, status: string) => {
    const response = await apiClient.put(`/admin/candidates/${candidateId}/verify`, { status });
    return response.data;
  },

  verifyDocument: async (documentId: number, status: string) => {
    const response = await apiClient.put(`/admin/documents/${documentId}/verify`, { status });
    return response.data;
  }
};
