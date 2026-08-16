import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SHOP_DOMAIN = import.meta.env.VITE_SHOP_DOMAIN || 'development-store.myshopify.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Shop': SHOP_DOMAIN
  },
  params: {
    shop: SHOP_DOMAIN
  }
});

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
