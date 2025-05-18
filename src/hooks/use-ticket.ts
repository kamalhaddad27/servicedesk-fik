'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { useDebounce } from './use-debounce';
import { 
  Ticket, 
  TicketMessage, 
  DisposisiHistory, 
  TicketStats,
  PaginatedResponse
} from '@/types';

export function useTickets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    department: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [debouncedSearch] = useDebounce(filters.search, 500);

  // Update filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when explicitly changing page)
      page: newFilters.page ? newFilters.page : 1,
    }));
  };

  // Pagination controls
  const nextPage = () => {
    if (filters.page < totalPages) {
      updateFilters({ page: filters.page + 1 });
    }
  };

  const prevPage = () => {
    if (filters.page > 1) {
      updateFilters({ page: filters.page - 1 });
    }
  };

  // Get tickets with pagination
  const {
    data: ticketsData,
    isLoading,
    isError,
    error,
  } = useQuery<PaginatedResponse<Ticket>>({
    queryKey: ['tickets', filters, debouncedSearch],
    queryFn: () => ApiService.getTicketsPaginated({
      ...filters,
      search: debouncedSearch,
    }),
  });

  // Extract pagination data
  const tickets = ticketsData?.data || [];
  const totalItems = ticketsData?.total || 0;
  const totalPages = ticketsData?.totalPages || 1;
  const currentPage = ticketsData?.page || 1;

  // Get ticket stats
  const useTicketStats = () => {
    return useQuery({
      queryKey: ['ticketStats'],
      queryFn: () => ApiService.getTicketStats(),
    });
  };

  // Get ticket by ID
  const useTicketDetail = (ticketId: number) => {
    return useQuery({
      queryKey: ['ticket', ticketId],
      queryFn: () => ApiService.getTicketById(ticketId),
      enabled: !!ticketId,
    });
  };

  // Get ticket messages
  const useTicketMessages = (ticketId: number) => {
    return useQuery({
      queryKey: ['ticketMessages', ticketId],
      queryFn: () => ApiService.getTicketMessages(ticketId),
      enabled: !!ticketId,
    });
  };

  // Get disposisi history
  const useDisposisiHistory = (ticketId: number) => {
    return useQuery({
      queryKey: ['disposisiHistory', ticketId],
      queryFn: () => ApiService.getDisposisiHistory(ticketId),
      enabled: !!ticketId,
    });
  };

  // Create ticket
  const createTicket = useMutation({
    mutationFn: (formData: FormData) => ApiService.createTicket(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
      toast({
        title: 'Tiket berhasil dibuat',
        description: 'Tiket Anda telah berhasil dibuat.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal membuat tiket',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Update ticket
  const updateTicket = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Ticket> }) => 
      ApiService.updateTicket(id, data),
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', updatedTicket.id] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
      toast({
        title: 'Tiket berhasil diperbarui',
        description: 'Perubahan pada tiket telah disimpan.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal memperbarui tiket',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Add message to ticket
  const addMessage = useMutation({
    mutationFn: ({ ticketId, formData }: { ticketId: number; formData: FormData }) => 
      ApiService.addMessageToTicket(ticketId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticketMessages', variables.ticketId] });
      toast({
        title: 'Pesan berhasil ditambahkan',
        description: 'Pesan Anda telah berhasil ditambahkan ke tiket.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal menambahkan pesan',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Disposisi ticket
  const disposisiTicket = useMutation({
    mutationFn: ({ 
      ticketId, 
      toUserId, 
      reason, 
      notes, 
      updateProgress, 
      actionType 
    }: { 
      ticketId: number; 
      toUserId: number; 
      reason: string; 
      notes?: string; 
      updateProgress?: number; 
      actionType: 'forward' | 'escalate' | 'return'; 
    }) => 
      ApiService.disposisiTicket(ticketId, { 
        toUserId, 
        reason, 
        notes, 
        updateProgress, 
        actionType 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['disposisiHistory', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Tiket berhasil didisposisi',
        description: 'Tiket telah berhasil didisposisi ke pengguna lain.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal mendisposisi tiket',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Quick resolve ticket
  const quickResolveTicket = useMutation({
    mutationFn: ({ ticketId, solution }: { ticketId: number; solution: string }) => 
      ApiService.quickResolveTicket(ticketId, solution),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
      toast({
        title: 'Tiket berhasil diselesaikan',
        description: 'Tiket telah berhasil diselesaikan dengan cepat.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal menyelesaikan tiket',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  return {
    // Queries
    tickets,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    isError,
    error,
    filters,
    
    // Query hooks
    useTicketDetail,
    useTicketMessages,
    useDisposisiHistory,
    useTicketStats,
    
    // Mutations
    createTicket,
    updateTicket,
    addMessage,
    disposisiTicket,
    quickResolveTicket,
    
    // Filter and pagination
    updateFilters,
    nextPage,
    prevPage,
  };
}
