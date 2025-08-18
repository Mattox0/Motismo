'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { JoinClasseSection } from '@/components/sections/JoinClasseSection';
import { ClasseMePage } from '@/containers/ClasseMePage';
import { useGetMyClassQuery, useJoinClasseByCodeMutation } from '@/services/classe.service';
import { IUserRole } from '@/types/IUserRole';
import { showToast } from '@/utils/toast';

export const StudentClassePage: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [joinClasse, { isLoading }] = useJoinClasseByCodeMutation();

  const { data: myClass, isLoading: isLoadingMyClass } = useGetMyClassQuery(undefined, {
    skip: !session?.accessToken,
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth');
      return;
    }

    if (session.user.role !== IUserRole.Student) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const handleJoinClasse = async (data: { code: string }) => {
    try {
      const classe = await joinClasse({ code: data.code }).unwrap();
      showToast.success(t('classe.join.success', { name: classe.name }));
      router.push('/class');
    } catch (error) {
      console.error('Error joining class:', error);
      showToast.error(t('classe.join.error'));
    }
  };

  if (status === 'loading' || isLoadingMyClass) {
    return (
      <div className="student-classe-page">
        <div className="parent-loader">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== IUserRole.Student) {
    return null;
  }

  if (myClass) {
    return <ClasseMePage />;
  }

  return (
    <div className="student-classe-page">
      <div className="student-classe-page__header">
        <h1 className="student-classe-page__title">{t('classe.student.title')}</h1>
      </div>

      <div className="student-classe-page__content">
        <JoinClasseSection onSubmit={handleJoinClasse} isLoading={isLoading} />
      </div>
    </div>
  );
};
