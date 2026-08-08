import apiClient from '../services/apiClient';

const BASE = '/resume-builder';

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface AtsScoreDto {
    totalScore: number;
    keywordScore: number;
    skillsScore: number;
    experienceScore: number;
    formattingScore: number;
    roleAlignmentScore: number;
    feedback: string;
}

export interface ExperienceSection {
    company: string;
    jobTitle: string;
    startDate: string;
    endDate: string | null;
    bullets: string[];
}

export interface EducationSection {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string | null;
    description?: string;
}

export interface ResumeVersionData {
    candidateName: string;
    email: string;
    phone: string;
    location: string;
    professionalSummary: string;
    skills: string[];
    experiences: ExperienceSection[];
    educations: EducationSection[];
    certifications: string[];
    keywords: string[];
    targetIndustry: string;
    targetCountry: string;
    targetRole: string;
    resumeTemplate: string;
    resumeStyle: string;
    atsScore: number;
    aiFeedback: string;
}

export interface ResumeVersionDto {
    id: number;
    versionName: string;
    versionDataJson: string;          // serialized ResumeVersionData
    targetIndustry: string;
    targetCountry: string;
    targetRole: string;
    resumeTemplate: string;
    atsScore: number;
    aiFeedback: string;
    generationStatus: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    updatedAt: string;
    createdAt: string;
}

export interface ResumeParsingJobDto {
    id: number;
    originalFileName: string;
    status: string;
    errorMessage: string;
    updatedAt: string;
}

export interface ResumeBuilderResponseDto {
    candidateId: number;
    compositeProfileJson: string;
    latestAtsScore: AtsScoreDto;
    savedVersions: ResumeVersionDto[];
    latestParsingJob: ResumeParsingJobDto;
}

export interface TargetCustomizationRequest {
    industry: string;
    country: string;
    jobDescription: string;
    targetRole: string;
    experienceLevel: string;
    resumeTemplate: string;
    language: string;
    targetCompany: string;
    extraKeywords: string[];
    resumeStyle: string;
    includeProjects: boolean;
    includeCertifications: boolean;
    pageLimit: number;
    exportFormat: string;
}

// ── API functions ────────────────────────────────────────────────────────────

export const resumeBuilderApi = {
    /** Composite page-load data */
    getResumeBuilderData: async (): Promise<ResumeBuilderResponseDto> => {
        const { data } = await apiClient.get(BASE);
        return data;
    },

    /** Upload existing resume for parsing */
    uploadExistingResume: async (file: File): Promise<ResumeParsingJobDto> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await apiClient.post(`${BASE}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /** Kick off async resume generation – returns 202 with PROCESSING version */
    generateVersion: async (request: TargetCustomizationRequest): Promise<ResumeVersionDto> => {
        const { data } = await apiClient.post(`${BASE}/versions`, request);
        return data;
    },

    /** Poll for version status / data */
    getVersion: async (versionId: number): Promise<ResumeVersionDto> => {
        const { data } = await apiClient.get(`${BASE}/versions/${versionId}`);
        return data;
    },

    /** Delete a saved version */
    deleteVersion: async (versionId: number): Promise<void> => {
        await apiClient.delete(`${BASE}/versions/${versionId}`);
    },

    /** Download resume — triggers browser download or print dialog for PDF */
    downloadVersion: (versionId: number, format: 'PDF' | 'DOCX' | 'JSON') => {
        const token = localStorage.getItem('token') || '';
        const url = `http://localhost:8080/api${BASE}/versions/${versionId}/download?format=${format}`;

        if (format === 'PDF') {
            // Open HTML in a new window and trigger print dialog (user saves as PDF)
            fetch(url, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.text())
                .then(html => {
                    const win = window.open('', '_blank');
                    if (!win) { alert('Please allow pop-ups to download as PDF'); return; }
                    win.document.write(html);
                    win.document.close();
                    // Give images/fonts time to load, then print
                    win.onload = () => { win.focus(); win.print(); };
                    // Fallback if onload already fired
                    setTimeout(() => { try { win.focus(); win.print(); } catch {} }, 800);
                })
                .catch(() => alert('Download failed. Please try again.'));
            return;
        }

        // DOCX / JSON — download as file
        const ext = format === 'DOCX' ? 'doc' : 'json';
        const mime = format === 'DOCX'
            ? 'application/msword'
            : 'application/json';

        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                return res.blob();
            })
            .then(blob => {
                const typedBlob = new Blob([blob], { type: mime });
                const blobUrl = URL.createObjectURL(typedBlob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `Resume.${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            })
            .catch(err => alert(`Download failed: ${err.message}`));
    },
};
