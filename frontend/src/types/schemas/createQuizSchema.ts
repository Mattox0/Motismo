import { z } from 'zod';

export const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, 'create_quiz.validation.title_min_length')
    .max(50, 'create_quiz.validation.title_max_length'),
  image: z
    .instanceof(File, { message: 'create_quiz.validation.image_file' })
    .refine(file => file.size <= 5 * 1024 * 1024, 'create_quiz.validation.image_size')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
      'create_quiz.validation.image_type'
    ),
  classIds: z.array(z.string()).default([]),
});

export type CreateQuizFormData = z.infer<typeof createQuizSchema>;
