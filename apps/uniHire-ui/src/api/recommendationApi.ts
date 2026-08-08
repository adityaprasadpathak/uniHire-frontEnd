import apiClient from '../services/apiClient';

export interface RecommendedCandidateDto {
  candidateId: number;
  name: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceYears: number;
  highestDegree: string | null;
  certifications: string[];
  reason: string;
}

export interface RecommendedJobDto {
  jobId: number;
  title: string;
  companyName: string;
  location: string | null;
  employmentType: string | null;
  salary: string | null;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
}

export const recommendationApi = {
  /** Employer: Get recommended candidates for a job */
  getRecommendedCandidates: async (jobId: number): Promise<RecommendedCandidateDto[]> => {
    const response = await apiClient.get(`/recommendations/jobs/${jobId}/candidates`);
    return response.data;
  },

  /** Candidate: Get recommended jobs for the logged-in candidate */
  getRecommendedJobs: async (): Promise<RecommendedJobDto[]> => {
    const response = await apiClient.get('/recommendations/candidates/me/jobs');
    return response.data;
  },

  /** Trigger re-generation of recommendations for a job */
  triggerJobRecommendations: async (jobId: number): Promise<string> => {
    const response = await apiClient.post(`/recommendations/jobs/${jobId}/generate`);
    return response.data;
  },

  /** Trigger re-generation of recommendations for a candidate */
  triggerCandidateRecommendations: async (): Promise<string> => {
    const response = await apiClient.post('/recommendations/candidates/me/generate');
    return response.data;
  },
};
