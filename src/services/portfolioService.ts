import api from './api';

export interface PortfolioEntry {
    _id: string;
    workerId: string;
    title: string;
    description: string;
    category: string;
    images: string[];
    clientName: string;
    location: string;
    duration: string;
    completionYear: number;
    isVisible: boolean;
    createdAt: string;
}

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Pro';

export const addPortfolioEntry = async (formData: FormData) => {
    const response = await api.post('/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getMyPortfolio = async () => {
    const response = await api.get('/portfolio/me');
    return response.data;
};

export const getWorkerPortfolio = async (userId: string) => {
    const response = await api.get(`/portfolio/${userId}`);
    return response.data;
};

export const deletePortfolioEntry = async (id: string) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data;
};

export const updatePortfolioEntry = async (id: string, data: Partial<PortfolioEntry>) => {
    const response = await api.put(`/portfolio/${id}`, data);
    return response.data;
};

export const EXPERIENCE_LEVEL_CONFIG = {
    Beginner: {
        label: 'Beginner',
        color: 'from-emerald-500 to-green-600',
        textColor: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        emoji: '🌱',
        description: 'Just starting out — keep going!',
        hyeEligible: true
    },
    Intermediate: {
        label: 'Intermediate',
        color: 'from-blue-500 to-indigo-600',
        textColor: 'text-blue-600',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        emoji: '⚒️',
        description: 'Proven experience — keep building!',
        hyeEligible: false
    },
    Pro: {
        label: 'Pro',
        color: 'from-purple-500 to-violet-600',
        textColor: 'text-purple-600',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        emoji: '🏆',
        description: 'Expert-level craftsperson!',
        hyeEligible: false
    }
};
