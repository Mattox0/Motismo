import { z } from 'zod';

export const editCardSchema = z.object({
  title: z
    .string()
    .min(3, 'edit_card.validation.title_min_length')
    .max(50, 'edit_card.validation.title_max_length'),
  image: z
    .instanceof(File, { message: 'edit_card.validation.image_file' })
    .refine(file => file.size <= 5 * 1024 * 1024, 'edit_card.validation.image_size')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
      'edit_card.validation.image_type'
    )
    .optional(),
  classIds: z.array(z.string()),
});

export type EditCardFormData = {
  title: string;
  image?: File;
  classIds: string[];
};
