'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { ClassePage } from '@/containers/ClassePage';
import { StudentClassePage } from '@/containers/StudentClassePage';
import { GlobalLayout } from '@/layout/GlobalLayout';
import { IUserRole } from '@/types/IUserRole';

export default function ClassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <GlobalLayout>
        <div className="parent-loader">
          <span className="loader"></span>
        </div>
      </GlobalLayout>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <GlobalLayout>
      {session.user.role === IUserRole.Student ? <StudentClassePage /> : <ClassePage />}
    </GlobalLayout>
  );
}
