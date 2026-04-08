import axios from 'axios';

// During local dev, VITE_API_URL is undefined and we use the Vite proxy ('/api').
// In production on Vercel, we specify the mapped Render backend endpoint.
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api' 
});

export default api;
