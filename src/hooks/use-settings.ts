'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { TicketCategories } from '@/types';

export function useSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all settings
  const {
    data: settings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
    error: errorSettings,
  } = useQuery<Record<string, any>>({
    queryKey: ['settings'],
    queryFn: () => ApiService.getAllSettings(),
  });

  // Get ticket categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
  } = useQuery<TicketCategories>({
    queryKey: ['settings', 'ticket-categories'],
    queryFn: () => ApiService.getTicketCategories(),
  });

  // Get settings by category
  const useSettingsByCategory = (category: string) => {
    return useQuery<Record<string, any>>({
      queryKey: ['settings', 'category', category],
      queryFn: () => ApiService.getSettingsByCategory(category),
      enabled: !!category,
    });
  };

  // Get single setting
  const useSingleSetting = (key: string) => {
    return useQuery<{ key: string; value: any }>({
      queryKey: ['settings', key],
      queryFn: () => ApiService.getSingleSetting(key),
      enabled: !!key,
    });
  };

  // Update setting
  const updateSetting = useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: any; description?: string }) => 
      ApiService.updateSetting(key, value, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', variables.key] });
      toast({
        title: 'Pengaturan berhasil diperbarui',
        description: 'Pengaturan telah berhasil diperbarui.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal memperbarui pengaturan',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Update multiple settings
  const updateMultipleSettings = useMutation({
    mutationFn: (settings: Record<string, any>) => ApiService.updateMultipleSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Pengaturan berhasil diperbarui',
        description: 'Semua pengaturan telah berhasil diperbarui.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal memperbarui pengaturan',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  // Initialize default settings
  const initializeDefaultSettings = useMutation({
    mutationFn: () => ApiService.initializeDefaultSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Pengaturan default berhasil diinisialisasi',
        description: 'Pengaturan default telah berhasil diinisialisasi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal menginisialisasi pengaturan default',
        description: ApiService.handleError(error),
        variant: 'destructive',
      });
    },
  });

  return {
    // Queries
    settings,
    categories,
    isLoading: isLoadingSettings || isLoadingCategories,
    isError: isErrorSettings || isErrorCategories,
    error: errorSettings || errorCategories,
    
    // Query hooks
    useSettingsByCategory,
    useSingleSetting,
    
    // Mutations
    updateSetting,
    updateMultipleSettings,
    initializeDefaultSettings,
  };
}
