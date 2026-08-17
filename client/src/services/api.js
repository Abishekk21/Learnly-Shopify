import axios from 'axios';
import { getSessionToken } from '@shopify/app-bridge/utilities';
import { createApp } from '@shopify/app-bridge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get shop and host from URL params
const params = new URLSearchParams(window.location.search);
const shop = params.get('shop');
const host = params.get('host');

// Check if we're in an embedded context
const isEmbedded = window.top !== window.self && host;

// Initialize App Bridge if embedded
let appBridge = null;
if (isEmbedded) {
  try {
    appBridge = createApp({
      apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
      host: host,
    });
  } catch (error) {
    console.error('Failed to initialize App Bridge:', error);
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication
api.interceptors.request.use(
  async (config) => {
    if (isEmbedded && appBridge) {
      // Get session token from App Bridge for embedded apps
      try {
        const sessionToken = await getSessionToken(appBridge);
        config.headers.Authorization = `Bearer ${sessionToken}`;
      } catch (error) {
        console.error('Failed to get session token:', error);
      }
    } else if (shop) {
      // Fallback for development/non-embedded: use shop param and header
      config.params = { ...config.params, shop };
      config.headers['X-Shopify-Shop'] = shop;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed:', error.response.data);
      // In embedded context, App Bridge will handle re-authentication
      if (!isEmbedded && shop) {
        // For non-embedded, could redirect to auth
        window.location.href = `${API_URL}/api/auth?shop=${shop}`;
      }
    }
    return Promise.reject(error);
  }
);

// Dashboard
export const getDashboard = () => api.get('/api/dashboard');

// Shop
export const getShopInfo = () => api.get('/api/shop');

// Courses
export const getCourses = (params = {}) => api.get('/api/courses', { params });
export const getCourse = (id) => api.get(`/api/courses/${id}`);
export const createCourse = (data) => api.post('/api/courses', data);
export const updateCourse = (id, data) => api.put(`/api/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/api/courses/${id}`);

// Students
export const getStudents = (params = {}) => api.get('/api/students', { params });
export const getStudent = (id) => api.get(`/api/students/${id}`);
export const createStudent = (data) => api.post('/api/students', data);
export const deleteStudent = (id) => api.delete(`/api/students/${id}`);
export const getStudentDashboard = (id) => api.get(`/api/students/${id}/dashboard`);

// Enrollments
export const getEnrollments = (params = {}) => api.get('/api/enrollments', { params });
export const createEnrollment = (data) => api.post('/api/enrollments', data);
export const updateEnrollment = (id, data) => api.patch(`/api/enrollments/${id}`, data);
export const deleteEnrollment = (id) => api.delete(`/api/enrollments/${id}`);

export default api;
