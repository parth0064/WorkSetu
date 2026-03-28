import api from './api';

export const getJobs = async () => {
    const response = await api.get('/jobs');
    return response.data;
};

export const getMyJobs = async () => {
    const response = await api.get('/jobs/my');
    return response.data;
};

export const getMyAssignedJobs = async () => {
    const response = await api.get('/jobs/my-assigned');
    return response.data;
};

export const getJobById = async (id: string) => {
    const response = await api.get(`/jobs/${id}`); // Assuming /api/jobs/:id exists or using list/filter
    return response.data;
};

export const createJob = async (jobData: any) => {
    const response = await api.post('/jobs/create', jobData);
    return response.data;
};

export const applyForJob = async (id: string) => {
    const response = await api.post(`/jobs/apply/${id}`);
    return response.data;
};

export const bookWorker = async (jobId: string, workerId: string) => {
    const response = await api.post('/jobs/book', { jobId, workerId });
    return response.data;
};

export const completeJob = async (completionData: { jobId: string; images?: string[]; rating?: number; comment?: string }) => {
    const response = await api.post('/jobs/complete', completionData);
    return response.data;
};

export const getJobRequests = async () => {
    const response = await api.get('/jobs/requests');
    return response.data;
};

export const updateJobRequestStatus = async (id: string, status: 'accepted' | 'rejected') => {
    const response = await api.put(`/jobs/requests/${id}`, { status });
    return response.data;
};
