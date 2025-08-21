import { zodResolver } from '@hookform/resolvers/zod';
import EmailIcon from '@mui/icons-material/EmailRounded';
import KeyIcon from '@mui/icons-material/VpnKeyRounded';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import Input from '@/components/forms/Input';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/ApiError';
import { createLoginSchema } from '@/types/schemas/createLoginForm';
import { showToast } from '@/utils/toast';

const LoginForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();

  const schema = createLoginSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data.email, data.password);
      if (!result?.error) {
        showToast.success(t('auth.loginSuccess'));
        router.push('/');
      }
    } catch (error) {
      showToast.error((error as ApiError)?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
        startAdornment={<KeyIcon />}
        isPassword
        placeholder="••••••••"
        registration={register('password')}
        error={errors.password?.message}
        autoComplete="current-password"
      />

      <button type="submit" className="btn btn-colored" disabled={isSubmitting}>
        {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
      </button>
    </form>
  );
};

export default LoginForm;
