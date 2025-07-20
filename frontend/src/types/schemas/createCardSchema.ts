import { z } from 'zod';

export const cardSchema = z
  .object({
    term: z.string().optional(),
    definition: z.string().optional(),
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
  })
  .refine(data => (data.term && !data.rectoImage) || (!data.term && data.rectoImage), {
    message: 'Vous devez fournir soit un terme, soit une image pour le recto',
    path: ['term'],
  })
  .refine(data => (data.definition && !data.versoImage) || (!data.definition && data.versoImage), {
    message: 'Vous devez fournir soit une définition, soit une image pour le verso',
    path: ['definition'],
  });
