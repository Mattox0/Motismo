'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClasseHeader } from '@/components/ClasseHeader';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StudentsList } from '@/components/StudentsList';
import { useGetClasseByCodeQuery } from '@/services/classe.service';
import { showToast } from '@/utils/toast';

interface IClasseDetailPageProps {
  params: Promise<{ code: string }>;
}

export const ClasseDetailPage: FC<IClasseDetailPageProps> = ({ params }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [code, setCode] = useState<string | null>(null);

  const {
    data: classe,
    isLoading,
    error,
  } = useGetClasseByCodeQuery({ code: code! }, { skip: !code || !session?.accessToken });

  useEffect(() => {
    const getCode = async () => {
      try {
        const { code: classeCode } = await params;

        if (!classeCode) {
          router.push('/class');
          return;
        }

        setCode(classeCode);
      } catch (error) {
        console.error('Error getting code:', error);
        router.push('/class');
      }
    };

    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth');
      return;
    }

    getCode();
  }, [params, session, status, router]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching class:', error);
      showToast.error(t('classe.notFound'));
      router.push('/class');
    }
  }, [error, router, t]);

  const handleBackToClasses = () => {
    router.push('/class');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="classe-detail-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (!classe) {
    return (
      <div className="classe-detail-page">
        <ErrorState title={t('classe.notFound')} onBackClick={handleBackToClasses} />
      </div>
    );
  }

  return (
    <div className="classe-detail-page">
      <ClasseHeader classe={classe} onBackClick={handleBackToClasses} />
      <div className="classe-detail-page__content">
        <StudentsList students={classe.students} />
      </div>
    </div>
  );
};
