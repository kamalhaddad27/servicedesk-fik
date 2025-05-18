// src/lib/api.ts
import axios from "axios";
import { getSession } from "next-auth/react";

// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://service-desk-fik-backend-production.up.railway.app";

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login if token invalid/expired
      window.location.href = "/login?error=session_expired";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Reusable API methods
export const apiClient = {
  // Auth endpoints
  auth: {
    loginWithEmail: (email: string, password: string) => 
      api.post("/auth/login", { email, password }),
    
    loginWithNIM: (nim: string, password: string) => 
      api.post("/auth/login/nim", { nim, password }),
    
    register: (data: any) => api.post("/auth/register", data),
    
    getProfile: () => api.get("/auth/profile"),
  },

  // Ticket endpoints
  tickets: {
    getAll: (params?: any) => api.get("/tickets", { params }),
    
    getById: (id: number) => api.get(`/tickets/${id}`),
    
    getMyTickets: () => api.get("/tickets/my"),
    
    create: (data: FormData) => api.post("/tickets", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    
    update: (id: number, data: any) => api.put(`/tickets/${id}`, data),
    
    delete: (id: number) => api.delete(`/tickets/${id}`),
    
    // Messages
    getMessages: (ticketId: number) => api.get(`/tickets/${ticketId}/messages`),
    
    addMessage: (ticketId: number, data: FormData) => 
      api.post(`/tickets/${ticketId}/messages`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    
    // Disposisi
    disposisi: (ticketId: number, data: any) => 
      api.post(`/tickets/${ticketId}/disposisi`, data),
    
    getDisposisiHistory: (ticketId: number) => 
      api.get(`/tickets/${ticketId}/disposisi-history`),
    
    quickResolve: (ticketId: number, solution: string) => 
      api.post(`/tickets/${ticketId}/quick-resolve`, { solution }),
    
    getPaginated: (params?: any) => api.get("/tickets/list", { params }),
    
    reassign: (ticketId: number, assignedTo: number, reason: string) => 
      api.put(`/tickets/${ticketId}/reassign`, { assignedTo, reason }),
    
    getStats: () => api.get("/tickets/stats"),
    
    getAssigned: () => api.get("/tickets/assigned-to-me"),
    
    updateSLA: () => api.get("/tickets/update-sla"),
    
    getWorkload: (userId: number) => api.get(`/tickets/workload/${userId}`),
  },

  // User endpoints
  users: {
    getAll: (params?: any) => api.get("/users", { params }),
    
    getById: (id: number) => api.get(`/users/${id}`),
    
    create: (data: any) => api.post("/users", data),
    
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    
    delete: (id: number) => api.delete(`/users/${id}`),
    
    getAvailableDosen: (department?: string) => 
      api.get("/users/dosen/available", { params: { department } }),
    
    getPerformance: (params?: any) => api.get("/users/performance", { params }),
    
    adminCreate: (data: any) => api.post("/users/admin/create", data),
    
    adminUpdate: (id: number, data: any) => api.put(`/users/admin/${id}`, data),
  },

  // Executive endpoints
  executive: {
    getDashboard: (params?: any) => 
      api.get("/tickets/executive/dashboard", { params }),
    
    getUserPerformance: (userId: number, params?: any) => 
      api.get(`/tickets/metrics/user/${userId}`, { params }),
    
    overrideDisposisi: (ticketId: number, data: any) => 
      api.post(`/tickets/${ticketId}/override-disposisi`, data),
    
    bulkUpdate: (ticketIds: number[], updates: any) => 
      api.post("/tickets/bulk/update", { ticketIds, updates }),
    
    exportTickets: (params?: any) => 
      api.get("/tickets/export", { params, responseType: "blob" }),
  },

  // Settings & workflow endpoints  
  settings: {
    getAll: () => api.get("/settings"),
    
    getByCategory: (category: string) => api.get(`/settings/category/${category}`),
    
    getSetting: (key: string) => api.get(`/settings/${key}`),
    
    updateSetting: (key: string, value: any, description?: string) => 
      api.put(`/settings/${key}`, { value, description }),
    
    updateMultiple: (settings: Record<string, any>) => api.put("/settings", settings),
    
    getTicketCategories: () => api.get("/settings/ticket-categories"),
    
    initializeDefaults: () => api.post("/settings/initialize-defaults"),
  },

  workflows: {
    getAll: (params?: any) => api.get("/tickets/workflows", { params }),
    
    create: (data: any) => api.post("/tickets/workflows", data),
    
    getTemplates: (params?: any) => api.get("/tickets/templates", { params }),
    
    createTemplate: (data: any) => api.post("/tickets/templates", data),
  },

  // Notifications
  notifications: {
    getAll: (unread?: boolean) => 
      api.get("/notifications", { params: { unread } }),
    
    markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
    
    markAllAsRead: () => api.put("/notifications/read-all"),
    
    delete: (id: number) => api.delete(`/notifications/${id}`),
  },
  
  // File management
  files: {
    deleteAttachment: (attachmentId: number) => 
      api.delete(`/tickets/attachments/${attachmentId}`),
  },
};