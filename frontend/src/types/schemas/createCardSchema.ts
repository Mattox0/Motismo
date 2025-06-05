import { z } from 'zod';

export const cardSchema = z.object({
  term: z.string().min(1, 'Le terme est requis'),
  definition: z.string().min(1, 'La définition est requise'),
  rectoImage: z
    .instanceof(File, { message: 'Le fichier image est requis' })
    .refine(file => file.size <= 5 * 1024 * 1024, "L'image ne doit pas dépasser 5MB")
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
      "Format d'image non supporté (JPEG, PNG, GIF uniquement)"
    )
    .optional(),
  versoImage: z
    .instanceof(File, { message: 'Le fichier image est requis' })
    .refine(file => file.size <= 5 * 1024 * 1024, "L'image ne doit pas dépasser 5MB")
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
      "Format d'image non supporté (JPEG, PNG, GIF uniquement)"
    )
    .optional(),
});
