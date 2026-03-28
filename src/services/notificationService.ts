import api from './api';

export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markAsRead = async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

export const clearAllNotifications = async () => {
    const response = await api.delete('/notifications/clear');
    return response.data;
};
