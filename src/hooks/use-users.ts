'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { useDebounce } from './use-debounce';
import { UserPerformance, User } from '../types';

export function useUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    search: '',
    available: false,
  });
  const [debouncedSearch] = useDebounce(filters.search, 500);

  // Update filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Get users
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery<User[]>({
    queryKey: ['users', filters, debouncedSearch],
    queryFn: () => ApiService.getUsers({
      ...filters,
      search: debouncedSearch,
    }),
  });

  // Get available dosen
  const useAvailableDosen = (department?: string) => {
    return useQuery<User[]>({
      queryKey: ['users', 'dosen', 'available', department],
      queryFn: () => ApiService.getAvailableDosen(department),
    });
  };

  // Get user by ID
  const useUserDetail = (userId: number) => {
    return useQuery<User>({
      queryKey: ['user', userId],
      queryFn: () => ApiService.getUserById(userId),
      enabled: !!userId,
    });
  };

  // Get users with performance
  const useUsersWithPerformance = (performanceFilters: {
    role?: string;
    department?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) => {
    return useQuery<(User & { performance: UserPerformance })[]>({
      queryKey: ['users', 'performance', performanceFilters],
      queryFn: () => ApiService.getUsersWithPerformance(performanceFilters),
    });
  };

  // Create user by admin
  const createUserByAdmin = useMutation({
    mutationFn: (userData: any) => ApiService.createUserByAdmin(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Pengguna berhasil dibuat',
        description: 'Pengguna baru telah berhasil dibuat.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal membuat pengguna',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Update user by admin
  const updateUserByAdmin = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: any }) => 
      ApiService.updateUserByAdmin(id, userData),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] });
      toast({
        title: 'Pengguna berhasil diperbarui',
        description: 'Data pengguna telah berhasil diperbarui.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal memperbarui pengguna',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Delete user
  const deleteUser = useMutation({
    mutationFn: (id: number) => ApiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Pengguna berhasil dihapus',
        description: 'Pengguna telah berhasil dihapus dari sistem.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal menghapus pengguna',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  return {
    // Queries
    users,
    isLoading,
    isError,
    error,
    filters,
    
    // Query hooks
    useUserDetail,
    useAvailableDosen,
    useUsersWithPerformance,
    
    // Mutations
    createUserByAdmin,
    updateUserByAdmin,
    deleteUser,
    
    // Filters
    updateFilters,
  };
}
