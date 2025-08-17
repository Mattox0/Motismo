'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';
import { createClasseSchema, CreateClasseFormData } from '@/types/schemas/createClasseSchema';

import Input from './Input';

interface ICreateClasseFormProps {
  onSubmit: (data: CreateClasseFormData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateClasseForm: FC<ICreateClasseFormProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateClasseFormData>({
    resolver: zodResolver(createClasseSchema),
  });

  const handleFormSubmit = async (data: CreateClasseFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="create-classe-form">
      <div className="form-group">
        <Input
          label={t('classe.name')}
          placeholder={t('classe.namePlaceholder')}
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      <Button variant="primary" type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? t('common.loading') : t('classe.create')}
      </Button>
    </form>
  );
};
