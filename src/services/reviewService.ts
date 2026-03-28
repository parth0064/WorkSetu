import api from './api';

export interface FeedbackPayload {
    jobId: string;
    rating?: number;          // 1–5
    notSatisfied?: boolean;   // true = rating 0, -1 point
    completedEarly?: boolean;
    hypeAwarded?: boolean;
    comment?: string;
}

export interface ReviewData {
    _id: string;
    jobId: string | { _id: string; title: string };
    reviewerId: { _id: string; name: string; profileImage?: string };
    workerId: { _id: string; name: string };
    rating: number;
    notSatisfied: boolean;
    pointsAwarded: number;
    comment: string;
    createdAt: string;
}

// Submit feedback for a completed job
export const submitFeedback = async (payload: FeedbackPayload) => {
    const response = await api.post('/reviews', payload);
    return response.data;
};

// Check if feedback has been submitted for a job
export const getJobFeedback = async (jobId: string): Promise<{ success: boolean; submitted: boolean; data: ReviewData | null }> => {
    const response = await api.get(`/reviews/job/${jobId}`);
    return response.data;
};

// Get all reviews for a worker profile
export const getWorkerReviews = async (userId: string): Promise<{ success: boolean; count: number; data: ReviewData[] }> => {
    const response = await api.get(`/reviews/${userId}`);
    return response.data;
};
