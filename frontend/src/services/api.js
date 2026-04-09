import axios from 'axios';

// During local dev, VITE_API_URL is undefined and we use the Vite proxy ('/api').
// In production on Vercel, we specify the mapped Render backend endpoint.
const baseInput = import.meta.env.VITE_API_URL || '/api';
// Ensure the URL always ends with '/api/' for consistent routing
const normalizedBase = baseInput.endsWith('/api') || baseInput.endsWith('/api/')
  ? baseInput.replace(/\/?$/, '/')
  : baseInput.replace(/\/?$/, '/api/');

const api = axios.create({ 
  baseURL: normalizedBase,
  withCredentials: true
});

export default api;
