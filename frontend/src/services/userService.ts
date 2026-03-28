import api from './api';

export const updateProfile = async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

export const uploadProfilePhoto = async (formData: FormData) => {
    const response = await api.post('/users/profile-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getWorkers = async () => {
    const response = await api.get('/users/workers');
    return response.data;
};

export const getUserProfile = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};
