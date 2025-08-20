'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { contactFormSchema } from '@/types/schemas/createContactForm';

import Input from './Input';

type ContactFormData = z.infer<typeof contactFormSchema>;

export const ContactForm: FC = () => {
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

      toast.success(
        'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
      );

      reset();
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
      <div className="form-row">
        <Input
          label="Prénom *"
          type="text"
          registration={register('firstName')}
          error={errors.firstName?.message}
          autoComplete="given-name"
          placeholder="Votre prénom"
        />

        <Input
          label="Nom *"
          type="text"
          registration={register('lastName')}
          error={errors.lastName?.message}
          autoComplete="family-name"
          placeholder="Votre nom"
        />
      </div>

      <Input
        label="Email *"
        type="email"
        registration={register('email')}
        error={errors.email?.message}
        autoComplete="email"
        placeholder="votre.email@exemple.com"
      />

      <Input
        label="Sujet *"
        type="text"
        registration={register('subject')}
        error={errors.subject?.message}
        autoComplete="off"
        placeholder="Sujet de votre message"
      />

      <div className="form-field">
        <label htmlFor="message" className="form-label">
          Message *
        </label>
        <textarea
          id="message"
          className={`form-textarea ${errors.message ? 'input-error' : ''}`}
          placeholder="Votre message..."
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
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
        </button>
      </div>

      <p className="form-note">* Champs obligatoires</p>
    </form>
  );
};
