import { TFunction } from 'i18next';
import { z } from 'zod';

export const createQuestionSchema = (t: TFunction) => {
  const choiceSchema = z.object({
    text: z.string().min(1, t('validation.choiceRequired')),
    isCorrect: z.boolean(),
  });

  return z.object({
    title: z.string().min(1, t('validation.titleRequired')),
    image: z
      .instanceof(File, { message: 'create_quiz.validation.image_file' })
      .refine(file => file.size <= 5 * 1024 * 1024, 'create_quiz.validation.image_size')
      .refine(
        file => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
        'create_quiz.validation.image_type'
      )
      .optional(),
    choices: z
      .array(choiceSchema)
      .min(2, t('validation.minAnswers'))
      .max(6, t('validation.maxAnswers')),
  });
};
