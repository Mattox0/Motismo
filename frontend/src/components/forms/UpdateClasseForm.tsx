'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/forms/Button';
import { updateClasseSchema, UpdateClasseFormData } from '@/types/schemas/updateClasseSchema';

import Input from './Input';

interface IUpdateClasseFormProps {
  onSubmit: (data: UpdateClasseFormData) => Promise<void>;
  isLoading?: boolean;
  initialName: string;
}

export const UpdateClasseForm: FC<IUpdateClasseFormProps> = ({
  onSubmit,
  isLoading = false,
  initialName,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateClasseFormData>({
    resolver: zodResolver(updateClasseSchema),
    defaultValues: {
      name: initialName,
    },
  });

  const handleFormSubmit = async (data: UpdateClasseFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="update-classe-form">
      <div className="form-group">
        <Input
          label={t('classe.name')}
          placeholder={t('classe.namePlaceholder')}
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      <Button variant="primary" type="submit" disabled={isLoading}>
        {isLoading ? t('common.loading') : t('common.save')}
      </Button>
    </form>
  );
};
