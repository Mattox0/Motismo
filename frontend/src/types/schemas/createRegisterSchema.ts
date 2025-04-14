import { TFunction } from 'i18next';
import { z } from 'zod';

export const createRegisterSchema = (t: TFunction) => {
  return z
    .object({
      name: z.string().min(2, t('validation.nameRequired')),
      email: z.string().email(t('validation.invalidEmail')),
      password: z.string().min(8, t('validation.passwordMinLength')),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordsMustMatch'),
      path: ['confirmPassword'],
    });
};
