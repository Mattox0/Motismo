import { z } from 'zod';

export const createClasseSchema = z.object({
  name: z.string().min(3, 'Le nom de la classe doit contenir au moins 3 caractères'),
});

export type CreateClasseFormData = z.infer<typeof createClasseSchema>;
