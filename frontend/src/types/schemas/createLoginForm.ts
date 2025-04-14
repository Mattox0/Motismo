import { TFunction } from 'i18next';
import { z } from 'zod';

export const createLoginSchema = (t: TFunction) => {
  return z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(8, t('validation.passwordMinLength')),
  });
};
