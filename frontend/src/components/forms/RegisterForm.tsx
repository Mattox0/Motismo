import { zodResolver } from '@hookform/resolvers/zod';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import Input from '@/components/forms/Input';
import { createRegisterSchema } from '@/types/schemas/createRegisterSchema';

const RegisterForm = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = createRegisterSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      // Simulation d'enregistrement - à remplacer par votre logique d'API
      console.log('Register data:', data);

      // Simulation d'un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Rediriger après inscription ou montrer un message de succès
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(t('auth.registerError'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {serverError && <div className="form-error-message">{serverError}</div>}

      <Input
        label={t('auth.name')}
        startAdornment={<PersonOutlinedIcon />}
        placeholder={t('auth.namePlaceholder')}
        registration={register('name')}
        error={errors.name?.message}
      />

      <Input
        label={t('auth.email')}
        type="email"
        startAdornment={<EmailIcon />}
        placeholder={t('auth.emailPlaceholder')}
        registration={register('email')}
        error={errors.email?.message}
      />

      <Input
        label={t('auth.password')}
        isPassword
        startAdornment={<LockOutlinedIcon />}
        placeholder={t('auth.passwordPlaceholder')}
        registration={register('password')}
        error={errors.password?.message}
      />

      <Input
        label={t('auth.confirmPassword')}
        isPassword
        startAdornment={<LockOutlinedIcon />}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        registration={register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

      <button type="submit" className="btn btn-colored" disabled={isSubmitting}>
        {isSubmitting ? t('auth.registering') : t('auth.register')}
      </button>
    </form>
  );
};

export default RegisterForm;
