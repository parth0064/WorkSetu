import api from './api';

export interface ProjectPayload {
  title: string;
  description: string;
  requiredSkills: string[];
  location?: string;
  duration: string;
  monthlyDuration?: string;
  totalWorkers: number;
  totalDays: number;
  wagePerDay: number;
  totalBudget?: number;
  isPublicPost?: boolean;
}

// ─── Constructor ──────────────────────────────────────────────────────────────
export const createProject = (data: ProjectPayload) =>
  api.post('/projects/create', data).then(r => r.data);

export const updateProject = (id: string, data: Partial<ProjectPayload & { isPublicPost: boolean; status: string }>) =>
  api.patch(`/projects/${id}`, data).then(r => r.data);

export const getMyProjects = () =>
  api.get('/projects/my').then(r => r.data);

export const getProjectById = (id: string) =>
  api.get(`/projects/${id}`).then(r => r.data);

export const deleteProject = (id: string) =>
  api.delete(`/projects/${id}`).then(r => r.data);

export const getProjectApplicants = (id: string) =>
  api.get(`/projects/${id}/applicants`).then(r => r.data);

export const assignWorker = (projectId: string, workerId: string) =>
  api.post('/projects/assign', { projectId, workerId }).then(r => r.data);

export const requestWorker = (projectId: string, workerId: string) =>
  api.post('/projects/request-worker', { projectId, workerId }).then(r => r.data);

export const completeProject = (data: { projectId: string; rating?: number; comment?: string }) =>
  api.post('/projects/complete', data).then(r => r.data);

// ─── Worker ───────────────────────────────────────────────────────────────────
export const getAllProjects = () =>
  api.get('/projects/all').then(r => r.data);

export const getAssignedProjects = () =>
  api.get('/projects/assigned').then(r => r.data);

export const getMyApplications = () =>
  api.get('/projects/my-applications').then(r => r.data);

export const applyToProject = (projectId: string) =>
  api.post('/projects/apply', { projectId }).then(r => r.data);

export const markDayComplete = (projectId: string) =>
  api.post('/projects/mark-day', { projectId }).then(r => r.data);

export const getProjectWorkHistory = () =>
  api.get('/projects/work-history').then(r => r.data);
