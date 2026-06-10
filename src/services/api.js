import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('elpipe_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('elpipe_token');
      localStorage.removeItem('elpipe_user');
    }
    return Promise.reject(err);
  }
);

export default api;
