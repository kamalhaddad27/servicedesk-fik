'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiService } from '@/lib/api';
import { User, UserRole } from '@/types';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user as User | undefined;
  const userRole = user?.role as UserRole | undefined;
  const isAuthenticated = status === 'authenticated';
  const isLoading2 = status === 'loading';

  const login = async ({
    email,
    nim,
    password,
  }: {
    email?: string;
    nim?: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      let result;

      if (email) {
        result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
      } else if (nim) {
        result = await signIn('credentials', {
          nim,
          password,
          redirect: false,
        });
      } else {
        throw new Error('Email atau NIM diperlukan');
      }

      if (result?.error) {
        setError(result.error);
        return false;
      }

      router.push('/dashboard');
      return true;
    } catch (err) {
      setError(ApiService.handleError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return {
    user,
    userRole,
    isAuthenticated,
    isLoading: isLoading || isLoading2,
    error,
    login,
    logout,
  };
}
