'use client';

import { AnimatePresence } from 'framer-motion';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';
import { CreateClasseForm } from '@/components/forms/CreateClasseForm';
import { Modal } from '@/components/Modal';
import { useCreateClasseMutation } from '@/services/classe.service';
import { CreateClasseFormData } from '@/types/schemas/createClasseSchema';
import { showToast } from '@/utils/toast';

export const CreateClasseSection: FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createClasse] = useCreateClasseMutation();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (data: CreateClasseFormData) => {
    try {
      await createClasse({ name: data.name }).unwrap();
      showToast.success(t('classe.createSuccess'));
      handleCloseModal();
    } catch (error) {
      console.error('Error creating class:', error);
      showToast.error(t('classe.createError'));
    }
  };

  return (
    <>
      <div className="create-classe-section">
        <div className="create-classe-section__content">
          <Button variant="primary" onClick={handleOpenModal}>
            {t('classe.createNew')}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Modal onClose={handleCloseModal} isOpen={isModalOpen} title={t('classe.createNew')}>
            <CreateClasseForm onSubmit={handleFormSubmit} />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};
