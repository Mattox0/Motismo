import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import { showToast } from '@/utils/toast';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        showToast.error(t('auth.errors.invalidCredentials'));
        return result;
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    username: string;
    image?: File;
  }) => {
    try {
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast.error(errorData.message || t('auth.errors.registrationFailed'));
        throw new Error(errorData.message || 'Registration failed');
      }

      const loginResult = await login(userData.email, userData.password);

      if (loginResult?.error) {
        throw new Error('Auto-login after registration failed');
      }

      return loginResult;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    session,
    status,
    login,
    register,
    logout,
  };
};
