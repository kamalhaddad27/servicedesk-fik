import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import {
  AuthResponse, 
  DisposisiHistory, 
  DisposisiPayload, 
  ExecutiveDashboardData, 
  Notification, 
  PaginatedResponse, 
  Ticket, 
  TicketCategories, 
  TicketMessage, 
  TicketStats, 
  User, 
  UserPerformance
} from '@/types';

// API base URL - from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-desk-fik-backend-production.up.railway.app/';

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common error scenarios
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - sign out user
      await signOut({ redirect: false });
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Type for API error response
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// Base API service class
export class ApiService {
  // GET request
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  }

  // POST request
  static async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<T, AxiosResponse<T>, D>(url, data, config);
    return response.data;
  }

  // PUT request
  static async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<T, AxiosResponse<T>, D>(url, data, config);
    return response.data;
  }

  // DELETE request
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  }

  // Helper for multipart form data (file uploads)
  static async postMultipart<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Helper function to handle API errors gracefully
  static handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      
      if (apiError?.message) {
        return apiError.message;
      }
      
      if (error.response?.status === 404) {
        return 'Data tidak ditemukan.';
      }
      
      if (error.response?.status === 403) {
        return 'Anda tidak memiliki akses untuk melakukan tindakan ini.';
      }
      
      return 'Terjadi kesalahan saat berkomunikasi dengan server.';
    }
    
    return 'Terjadi kesalahan yang tidak diketahui.';
  }

  // ===========================================
  // 1. Authentication Endpoints
  // ===========================================
  
  // Login with email
  static async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', { email, password });
  }
  
  // Login with NIM
  static async loginWithNIM(nim: string, password: string): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login/nim', { nim, password });
  }
  
  // Register
  static async register(userData: any): Promise<User> {
    return this.post<User>('/auth/register', userData);
  }
  
  // Get user profile
  static async getProfile(): Promise<User> {
    return this.get<User>('/auth/profile');
  }

  // ===========================================
  // 2. User Management Endpoints
  // ===========================================
  
  // Get all users
  static async getUsers(filters: { role?: string; department?: string; search?: string; available?: boolean } = {}): Promise<User[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return this.get<User[]>(`/users${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  // Get available dosen
  static async getAvailableDosen(department?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (department) {
      params.append('department', department);
    }
    
    return this.get<User[]>(`/users/dosen/available${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  // Get user by ID
  static async getUserById(id: number): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }
  
  // Create user by admin
  static async createUserByAdmin(userData: any): Promise<User> {
    return this.post<User>('/users/admin/create', userData);
  }
  
  // Update user by admin
  static async updateUserByAdmin(id: number, userData: any): Promise<User> {
    return this.put<User>(`/users/admin/${id}`, userData);
  }
  
  // Get users with performance
  static async getUsersWithPerformance(filters: { 
    role?: string; 
    department?: string; 
    search?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  } = {}): Promise<(User & { performance: UserPerformance })[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return this.get<(User & { performance: UserPerformance })[]>(`/users/performance${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  // Create user
  static async createUser(userData: any): Promise<User> {
    return this.post<User>('/users', userData);
  }
  
  // Update user
  static async updateUser(id: number, userData: any): Promise<User> {
    return this.put<User>(`/users/${id}`, userData);
  }
  
  // Delete user
  static async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`/users/${id}`);
  }

  // ===========================================
  // 3. Ticket Management Endpoints
  // ===========================================
  
  // Get all tickets
  static async getAllTickets(filters: { 
    status?: string; 
    category?: string; 
    priority?: string; 
  } = {}): Promise<Ticket[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return this.get<Ticket[]>(`/tickets${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  // Get my tickets
  static async getMyTickets(): Promise<Ticket[]> {
    return this.get<Ticket[]>('/tickets/my');
  }
  
  // Get ticket by ID
  static async getTicketById(id: number): Promise<Ticket> {
    return this.get<Ticket>(`/tickets/${id}`);
  }

  static async getTickets(filters: { 
    dateFrom: string; 
    dateTo: string; 
    department?: string; 
  }): Promise<Ticket[]> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
  
    return this.get<Ticket[]>(`/tickets${params.toString() ? `?${params.toString()}` : ''}`)
  }
  
  // Create ticket
  static async createTicket(formData: FormData): Promise<Ticket> {
    return this.postMultipart<Ticket>('/tickets', formData);
  }
  
  // Update ticket
  static async updateTicket(id: number, ticketData: Partial<Ticket>): Promise<Ticket> {
    return this.put<Ticket>(`/tickets/${id}`, ticketData);
  }
  
  // Delete ticket
  static async deleteTicket(id: number): Promise<void> {
    return this.delete<void>(`/tickets/${id}`);
  }
  
  // Get ticket messages
  static async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return this.get<TicketMessage[]>(`/tickets/${ticketId}/messages`);
  }
  
  // Add message to ticket
  static async addMessageToTicket(ticketId: number, formData: FormData): Promise<TicketMessage> {
    return this.postMultipart<TicketMessage>(`/tickets/${ticketId}/messages`, formData);
  }
  
  // Disposisi (forward) ticket
  static async disposisiTicket(ticketId: number, disposisiData: Omit<DisposisiPayload, 'ticketId'>): Promise<DisposisiHistory> {
    return this.post<DisposisiHistory>(`/tickets/${ticketId}/disposisi`, disposisiData);
  }
  
  // Quick resolve ticket
  static async quickResolveTicket(ticketId: number, solution: string): Promise<Ticket> {
    return this.post<Ticket>(`/tickets/${ticketId}/quick-resolve`, { solution });
  }
  
  // Get disposisi history
  static async getDisposisiHistory(ticketId: number): Promise<DisposisiHistory[]> {
    return this.get<DisposisiHistory[]>(`/tickets/${ticketId}/disposisi-history`);
  }
  
  // Get ticket list (paginated)
  static async getTicketsPaginated(params: {
    status?: string;
    category?: string;
    priority?: string;
    department?: string;
    assignedTo?: number;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Ticket>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    return this.get<PaginatedResponse<Ticket>>(`/tickets/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }
  
  // Reassign ticket
  static async reassignTicket(ticketId: number, assignedTo: number, reason: string): Promise<Ticket> {
    return this.put<Ticket>(`/tickets/${ticketId}/reassign`, { assignedTo, reason });
  }
  
  // Get ticket stats
  static async getTicketStats(): Promise<TicketStats> {
    return this.get<TicketStats>('/tickets/stats');
  }
  
  // Get assigned tickets
  static async getAssignedTickets(): Promise<Ticket[]> {
    return this.get<Ticket[]>('/tickets/assigned-to-me');
  }
  
  // Update SLA status
  static async updateSLAStatus(): Promise<{ updated: number; breachedTickets: string[] }> {
    return this.get<{ updated: number; breachedTickets: string[] }>('/tickets/update-sla');
  }
  
  // Get user workload
  static async getUserWorkload(userId: number): Promise<any> {
    return this.get<any>(`/tickets/workload/${userId}`);
  }
  
  // ===========================================
  // 4. Executive Endpoints
  // ===========================================
  
  // Get executive dashboard
  static async getExecutiveDashboard(params: {
    dateFrom?: string;
    dateTo?: string;
    department?: string;
  } = {}): Promise<ExecutiveDashboardData> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    return this.get<ExecutiveDashboardData>(`/tickets/executive/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }
  
  // Get user performance metrics
  static async getUserPerformanceMetrics(userId: number, params: {
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<UserPerformance & { 
    byCategory: any[]; 
    trendsOverTime: {
      weeks: string[];
      ticketsHandled: number[];
      avgResolutionTime: number[];
    };
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    return this.get<any>(`/tickets/metrics/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }
  
  // Override disposisi
  static async overrideDisposisi(ticketId: number, overrideData: {
    toUserId: number;
    reason: string;
    skipLevels: boolean;
  }): Promise<DisposisiHistory> {
    return this.post<DisposisiHistory>(`/tickets/${ticketId}/override-disposisi`, overrideData);
  }
  
  // Bulk update tickets
  static async bulkUpdateTickets(ticketIds: number[], updates: Partial<Ticket>): Promise<{ updated: number }> {
    return this.post<{ updated: number }>('/tickets/bulk/update', { ticketIds, updates });
  }
  
  // Export tickets
  static async exportTickets(params: {
    format: 'csv' | 'json' | 'excel';
    status?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    return this.get<any>(`/tickets/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  // ===========================================
  // 5. Workflow & Template Endpoints
  // ===========================================
  
  // Create workflow
  static async createWorkflow(workflowData: any): Promise<any> {
    return this.post<any>('/tickets/workflows', workflowData);
  }
  
  // Get workflows
  static async getWorkflows(category?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    
    return this.get<any[]>(`/tickets/workflows${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  // Create template
  static async createTemplate(templateData: any): Promise<any> {
    return this.post<any>('/tickets/templates', templateData);
  }
  
  // Get templates
  static async getTemplates(category?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (category) {
      params.append('category', category);
    }
    
    return this.get<any[]>(`/tickets/templates${params.toString() ? `?${params.toString()}` : ''}`);
  }

  // ===========================================
  // 6. Settings Endpoints
  // ===========================================
  
  // Get all settings
  static async getAllSettings(): Promise<Record<string, any>> {
    return this.get<Record<string, any>>('/settings');
  }
  
  // Get settings by category
  static async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    return this.get<Record<string, any>>(`/settings/category/${category}`);
  }
  
  // Get single setting
  static async getSingleSetting(key: string): Promise<{ key: string; value: any }> {
    return this.get<{ key: string; value: any }>(`/settings/${key}`);
  }
  
  // Update setting
  static async updateSetting(key: string, value: any, description?: string): Promise<{ key: string; value: any }> {
    return this.put<{ key: string; value: any }>(`/settings/${key}`, { value, description });
  }
  
  // Update multiple settings
  static async updateMultipleSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    return this.put<Record<string, any>>('/settings', settings);
  }
  
  // Get ticket categories
  static async getTicketCategories(): Promise<TicketCategories> {
    return this.get<TicketCategories>('/settings/ticket-categories');
  }
  
  // Initialize default settings
  static async initializeDefaultSettings(): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/settings/initialize-defaults');
  }

  // ===========================================
  // 7. Notification Endpoints
  // ===========================================
  
  // Get notifications
  static async getNotifications(unread?: boolean): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (unread !== undefined) {
      params.append('unread', String(unread));
    }
    
    return this.get<Notification[]>(`/notifications${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  // Mark notification as read
  static async markNotificationAsRead(id: number): Promise<{ success: boolean }> {
    return this.put<{ success: boolean }>(`/notifications/${id}/read`);
  }
  
  // Mark all notifications as read
  static async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.put<{ success: boolean }>('/notifications/read-all');
  }
  
  // Delete notification
  static async deleteNotification(id: number): Promise<void> {
    return this.delete<void>(`/notifications/${id}`);
  }

  // ===========================================
  // 8. File Management
  // ===========================================
  
  // Delete attachment
  static async deleteAttachment(attachmentId: number): Promise<void> {
    return this.delete<void>(`/tickets/attachments/${attachmentId}`);
  }
}

// Export default for convenient imports
export default ApiService;