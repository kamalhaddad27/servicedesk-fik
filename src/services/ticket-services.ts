import { ApiService } from '@/lib/api';
import {
  Ticket,
  TicketMessage,
  DisposisiPayload,
  DisposisiHistory,
  PaginatedResponse
} from '@/types';

export class TicketService {
  // Get all tickets with optional filtering
  static async getTickets(filters: Record<string, any> = {}): Promise<Ticket[]> {
    return ApiService.getAllTickets(filters);
  }
  
  // Get paginated tickets
  static async getTicketsPaginated(params: Record<string, any> = {}): Promise<PaginatedResponse<Ticket>> {
    return ApiService.getTicketsPaginated(params);
  }
  
  // Get a single ticket by ID
  static async getTicketById(id: number): Promise<Ticket> {
    return ApiService.getTicketById(id);
  }
  
  // Get tickets created by the current user
  static async getMyTickets(): Promise<Ticket[]> {
    return ApiService.getMyTickets();
  }
  
  // Get tickets assigned to the current user
  static async getAssignedTickets(): Promise<Ticket[]> {
    return ApiService.getAssignedTickets();
  }
  
  // Create a new ticket with possible file attachments
  static async createTicket(formData: FormData): Promise<Ticket> {
    return ApiService.createTicket(formData);
  }
  
  // Update an existing ticket
  static async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    return ApiService.updateTicket(id, data);
  }
  
  // Get messages for a ticket
  static async getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
    return ApiService.getTicketMessages(ticketId);
  }
  
  // Add a message to a ticket
  static async addTicketMessage(ticketId: number, formData: FormData): Promise<TicketMessage> {
    return ApiService.addMessageToTicket(ticketId, formData);
  }
  
  // Forward a ticket to another user (disposisi)
  static async disposisiTicket(payload: DisposisiPayload): Promise<DisposisiHistory> {
    const { ticketId, ...disposisiData } = payload;
    return ApiService.disposisiTicket(ticketId, disposisiData);
  }
  
  // Get disposisi history for a ticket
  static async getDisposisiHistory(ticketId: number): Promise<DisposisiHistory[]> {
    return ApiService.getDisposisiHistory(ticketId);
  }
  
  // Quick resolve a ticket
  static async quickResolveTicket(ticketId: number, solution: string): Promise<Ticket> {
    return ApiService.quickResolveTicket(ticketId, solution);
  }
  
  // Get ticket statistics
  static async getTicketStats(): Promise<any> {
    return ApiService.getTicketStats();
  }
}