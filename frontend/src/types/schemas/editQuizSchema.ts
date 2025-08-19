import { z } from 'zod';

export const editQuizSchema = z.object({
  title: z
    .string()
    .min(3, 'edit_quiz.validation.title_min_length')
    .max(50, 'edit_quiz.validation.title_max_length'),
  image: z
    .instanceof(File, { message: 'edit_quiz.validation.image_file' })
    .refine(file => file.size <= 5 * 1024 * 1024, 'edit_quiz.validation.image_size')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
      'edit_quiz.validation.image_type'
    )
    .optional(),
});

export type EditQuizFormData = z.infer<typeof editQuizSchema>;
