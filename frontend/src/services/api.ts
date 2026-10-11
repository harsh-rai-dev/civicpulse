import axios from 'axios';
import { User, Complaint, Vote, LoginPayload } from '../../../shared/types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials: { email: string; password: string; portal: 'citizen' | 'official' }) => api.post('/auth/login', credentials).then(r => r.data),
  register: (userData: any) => api.post('/auth/register', userData).then(r => r.data),

  requestReset: (email: string) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data).then(r => r.data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data).then(r => r.data),
};

export const complaintService = {
  list: (params?: any) => api.get<Complaint[]>('/complaints', { params }).then(r => r.data),
  get: (id: string) => api.get<Complaint>(`/complaints/${id}`).then(r => r.data),
  create: (data: any) => api.post<Complaint>('/complaints', data).then(r => r.data),
  updateStatus: (id: string, status: string, admin_reply?: string) => 
    api.patch(`/complaints/${id}/status`, { status, admin_reply }).then(r => r.data),
  delete: (id: string) => api.delete(`/complaints/${id}`).then(r => r.data),
  getPriorityPreview: (description: string, is_emergency: boolean) => 
    api.post('/priority/preview', { description, is_emergency }).then(r => r.data),
};

export const voteService = {
  upvote: (complaintId: string) => api.post(`/votes/${complaintId}`).then(r => r.data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  getComplaints: (params?: any) => api.get<Complaint[]>('/admin/complaints', { params }).then(r => r.data),
  updateStatus: (id: string, status: string) => api.patch(`/complaints/${id}/status`, { status }).then(r => r.data),
  resolve: (id: string, reply: string) => 
    api.patch(`/complaints/${id}/status`, { status: 'Resolved', admin_reply: reply }).then(r => r.data),
};

export default api;