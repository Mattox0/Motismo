import { TFunction } from 'i18next';
import { z } from 'zod';

export const createQuizCodeSchema = (t: TFunction) =>
  z.object({
    code: z
      .string()
      .pipe(z.string().transform((val: string) => val.toLowerCase()))
      .pipe(
        z
          .string()
          .min(6, t('validation.codeLength'))
          .max(6, t('validation.codeLength'))
          .regex(/^[a-z0-9]+$/, t('validation.codeInvalidFormat'))
      )
      .transform((val: string) => val.toUpperCase()),
  });
