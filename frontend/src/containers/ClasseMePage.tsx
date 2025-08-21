'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/forms/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useGetMyClassQuery, useLeaveClassMutation } from '@/services/classe.service';
import { IUserRole } from '@/types/IUserRole';
import { showToast } from '@/utils/toast';

export const ClasseMePage: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    data: classe,
    isLoading,
    error,
  } = useGetMyClassQuery(undefined, { skip: !session?.accessToken });

  const [leaveClass, { isLoading: isLeaving }] = useLeaveClassMutation();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth');
      return;
    }

    if (session.user.role !== IUserRole.Student) {
      router.push('/class');
    }
  }, [session, status, router, t]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching class:', error);
      showToast.error(t('classe.notInClass'));
      router.push('/class');
    }
  }, [error, router, t]);

  const handleBackToClasses = () => {
    router.push('/class');
  };

  const handleLeaveClass = async () => {
    try {
      await leaveClass().unwrap();
      showToast.success(t('classe.leaveClassSuccess'));
      window.location.href = '/class';
    } catch (error) {
      console.error('Error leaving class:', error);
      showToast.error(t('classe.leaveClassError'));
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="classe-me-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (!classe) {
    return (
      <div className="classe-me-page">
        <ErrorState title={t('classe.notInClass')} onBackClick={handleBackToClasses} />
      </div>
    );
  }

  return (
    <div className="classe-me-page">
      <div className="classe-me-page__content">
        <div className="classe-me-page__info">
          <h2>{t('classe.myClass')}</h2>
          <p>{t('classe.youAreInClass', { name: classe[0].name })}</p>
        </div>
        <div className="classe-me-page__actions">
          <Button variant="error" onClick={handleLeaveClass} type="button" disabled={isLeaving}>
            {isLeaving ? t('classe.leavingClass') : t('classe.leaveClass')}
          </Button>
        </div>
      </div>
    </div>
  );
};
