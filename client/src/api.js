import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401 or 403, the token is invalid/expired
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear all token storage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Clear global token if it exists
      if (window.sessionToken) {
        window.sessionToken = null;
      }
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;