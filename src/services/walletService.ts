import api from './api';

export const getWallet = async () => {
    const response = await api.get('/wallet');
    return response.data;
};

export const addFunds = async (amount: number) => {
    const response = await api.post('/wallet/add', { amount });
    return response.data;
};

export const getTransactions = async () => {
    const response = await api.get('/wallet/transactions');
    return response.data;
};

export const securePayment = async (jobId: string, amount?: number) => {
    const response = await api.post('/payments/secure', { jobId, amount });
    return response.data;
};

export const releasePayment = async (jobId: string, extraExpense?: number) => {
    const response = await api.post('/payments/release', { jobId, extraExpense });
    return response.data;
};

export const getExpenses = async () => {
    const response = await api.get('/expenses');
    return response.data;
};

export const addExpense = async (expenseData: { title: string; amount: number; date?: string }) => {
    const response = await api.post('/expenses/add', expenseData);
    return response.data;
};

export const deleteExpense = async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};
