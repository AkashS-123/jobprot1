import axios from 'axios';

// In dev, json-server runs on port 4000 (see package.json "server" script).
// In production, set VITE_API_URL to your deployed API's base URL
// (e.g. https://your-api.onrender.com) in your hosting provider's env settings.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL });

export default api;
