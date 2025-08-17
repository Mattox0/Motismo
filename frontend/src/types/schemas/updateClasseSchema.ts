import { z } from 'zod';

export const updateClasseSchema = z.object({
  name: z.string().min(3, 'Le nom de la classe doit contenir au moins 3 caractères'),
});

export type UpdateClasseFormData = z.infer<typeof updateClasseSchema>;
