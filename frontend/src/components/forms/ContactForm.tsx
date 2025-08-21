'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { contactFormSchema } from '@/types/schemas/createContactForm';

import Input from './Input';

type ContactFormData = z.infer<typeof contactFormSchema>;

export const ContactForm: FC = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(t('contact.success'));

      reset();
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error(t('contact.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
      <div className="form-row">
        <Input
          label={t('contact.form.firstName')}
          type="text"
          registration={register('firstName')}
          error={errors.firstName?.message}
          autoComplete="given-name"
          placeholder={t('contact.form.firstNamePlaceholder')}
        />

        <Input
          label={t('contact.form.lastName')}
          type="text"
          registration={register('lastName')}
          error={errors.lastName?.message}
          autoComplete="family-name"
          placeholder={t('contact.form.lastNamePlaceholder')}
        />
      </div>

      <Input
        label={t('contact.form.email')}
        type="email"
        registration={register('email')}
        error={errors.email?.message}
        autoComplete="email"
        placeholder={t('contact.form.emailPlaceholder')}
      />

      <Input
        label={t('contact.form.subject')}
        type="text"
        registration={register('subject')}
        error={errors.subject?.message}
        autoComplete="off"
        placeholder={t('contact.form.subjectPlaceholder')}
      />

      <div className="form-field">
        <label htmlFor="message" className="form-label">
          {t('contact.form.message')}
        </label>
        <textarea
          id="message"
          className={`form-textarea ${errors.message ? 'input-error' : ''}`}
          placeholder={t('contact.form.messagePlaceholder')}
          rows={6}
          {...register('message')}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="input-help-text input-error-text">{errors.message.message}</p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
        </button>
      </div>

      <p className="form-note">{t('contact.form.requiredFields')}</p>
    </form>
  );
};
