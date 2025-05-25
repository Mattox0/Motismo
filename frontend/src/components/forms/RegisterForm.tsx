import { zodResolver } from '@hookform/resolvers/zod';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import Input from '@/components/forms/Input';
import { useAuth } from '@/hooks/useAuth';
import { createRegisterSchema } from '@/types/schemas/createRegisterSchema';
import { showToast } from '@/utils/toast';

const RegisterForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = createRegisterSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        username: data.name,
      });
      showToast.success(t('auth.registerSuccess'));
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {serverError && <div className="form-error-message">{serverError}</div>}

      <Input
        label={t('auth.name')}
        type="text"
        startAdornment={<PersonOutlinedIcon />}
        placeholder={t('auth.namePlaceholder')}
        registration={formRegister('name')}
        error={errors.name?.message}
        autoComplete="name"
      />

      <Input
        label={t('auth.email')}
        type="email"
        startAdornment={<EmailIcon />}
        placeholder={t('auth.emailPlaceholder')}
        registration={formRegister('email')}
        error={errors.email?.message}
      />

      <Input
        label={t('auth.password')}
        isPassword
        startAdornment={<LockOutlinedIcon />}
        placeholder={t('auth.passwordPlaceholder')}
        registration={formRegister('password')}
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <Input
        label={t('auth.confirmPassword')}
        isPassword
        startAdornment={<LockOutlinedIcon />}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        registration={formRegister('confirmPassword')}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      <button type="submit" className="btn btn-colored" disabled={isSubmitting}>
        {t('auth.register')}
      </button>
    </form>
  );
};

export default RegisterForm;
