import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const bankingAPI = {
  getAccounts: async () => {
    const response = await axios.get(`${API_URL}/accounts`);
    return response.data;
  },
  getHistory: async (accountId) => {
    const response = await axios.get(`${API_URL}/history/${accountId}`);
    return response.data;
  },
  rollback: async (accountId, time) => {
    const response = await axios.post(`${API_URL}/rollback`, { acc_id: accountId, time });
    return response.data;
  },
  getAsOf: async (accountId, time) => {
    const response = await axios.post(`${API_URL}/as_of`, { acc_id: accountId, time });
    return response.data;
  },
  createTransaction: async (accountId, amount, type) => {
    const response = await axios.post(`${API_URL}/transaction`, { account_id: accountId, amount, type });
    return response.data;
  }
};
