'use client';

import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/components/forms/Input';

import { Button } from './Button';

interface IJoinClasseFormData {
  code: string;
}

interface IJoinClasseFormProps {
  onSubmit: (data: IJoinClasseFormData) => void;
  isLoading?: boolean;
}

export const JoinClasseForm: FC<IJoinClasseFormProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IJoinClasseFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="join-classe-form">
      <div className="join-classe-form__field">
        <Input
          label={t('classe.join.codeLabel')}
          placeholder={t('classe.join.codePlaceholder')}
          {...register('code', {
            required: t('classe.join.codeRequired'),
            minLength: {
              value: 6,
              message: t('classe.join.codeMinLength'),
            },
            maxLength: {
              value: 6,
              message: t('classe.join.codeMaxLength'),
            },
          })}
          error={errors.code?.message}
        />
      </div>

      <div className="join-classe-form__actions">
        <Button variant="primary" type="submit" disabled={isLoading}>
          {t('classe.join.submit')}
        </Button>
      </div>
    </form>
  );
};
