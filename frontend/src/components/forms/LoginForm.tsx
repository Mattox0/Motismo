import { zodResolver } from '@hookform/resolvers/zod';
import EmailIcon from '@mui/icons-material/EmailRounded';
import KeyIcon from '@mui/icons-material/VpnKeyRounded';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import Input from '@/components/forms/Input';
import { createLoginSchema } from '@/types/schemas/createLoginForm';

const LoginForm = () => {
  const { t } = useTranslation();

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
      // Appel API ici
      console.log('Form data:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <Input
        label="Email"
        startAdornment={<EmailIcon />}
        placeholder="votre@email.com"
        registration={register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Mot de passe"
        startAdornment={<KeyIcon />}
        isPassword
        placeholder="••••••••"
        registration={register('password')}
        error={errors.password?.message}
      />

      <button type="submit" className="btn btn-colored" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

export default LoginForm;
