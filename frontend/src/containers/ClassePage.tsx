'use client';

import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UpdateClasseForm } from '@/components/forms/UpdateClasseForm';
import { Modal } from '@/components/Modal';
import { ClasseListSection } from '@/components/sections/ClasseListSection';
import { CreateClasseSection } from '@/components/sections/CreateClasseSection';
import {
  useGetClassesQuery,
  useUpdateClasseMutation,
  useDeleteClasseMutation,
} from '@/services/classe.service';
import { IUserRole } from '@/types/IUserRole';
import { IClasse } from '@/types/model/IClasse';
import { showToast } from '@/utils/toast';

export const ClassePage: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: classes = [], isLoading } = useGetClassesQuery();
  const [updateClasse] = useUpdateClasseMutation();
  const [deleteClasse] = useDeleteClasseMutation();
  const [editingClasse, setEditingClasse] = useState<IClasse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/auth');
      return;
    }

    if (session.user.role !== IUserRole.Teacher && session.user.role !== IUserRole.Admin) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const handleEditClasse = (classe: IClasse) => {
    setEditingClasse(classe);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingClasse(null);
    setIsEditModalOpen(false);
  };

  const handleUpdateClasse = async (data: { name: string }) => {
    if (!editingClasse) return;

    try {
      await updateClasse({ id: editingClasse.id, name: data.name }).unwrap();
      showToast.success(t('classe.updateSuccess'));
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating class:', error);
      showToast.error(t('classe.updateError'));
    }
  };

  const handleDeleteClasse = async (classe: IClasse) => {
    try {
      await deleteClasse(classe.id).unwrap();
      showToast.success(t('classe.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting class:', error);
      showToast.error(t('classe.deleteError'));
    }
  };

  const handleViewClasse = (classe: IClasse) => {
    router.push(`/class/${classe.code}`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="classe-page">
        <div className="parent-loader">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  if (!session?.user || (session.user.role !== 'Teacher' && session.user.role !== 'Admin')) {
    return null;
  }

  return (
    <div className="classe-page">
      <div className="classe-page__header">
        <h1 className="classe-page__title">{t('classe.title')}</h1>
      </div>

      <CreateClasseSection />

      <div className="classe-page__content">
        <div className="classe-page__section">
          <span className="tag primary classe-page__section-title">{t('classe.myClasses')}</span>
          <ClasseListSection
            classes={classes}
            isLoading={isLoading}
            onEditClasse={handleEditClasse}
            onViewClasse={handleViewClasse}
            onDeleteClasse={handleDeleteClasse}
          />
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && editingClasse && (
          <Modal onClose={handleCloseEditModal} isOpen={isEditModalOpen} title={t('classe.edit')}>
            <UpdateClasseForm onSubmit={handleUpdateClasse} initialName={editingClasse.name} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
