import axios from 'axios';

/**
 * Central API client.
 *
 * For this frontend-only prototype every service falls back to local mock
 * data, so requests never hit the network. When a real backend is available
 * set VITE_API_URL and flip `USE_MOCK` to false in each service — the UI
 * components do not need to change.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cybertrace_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
