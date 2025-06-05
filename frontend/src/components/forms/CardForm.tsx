'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import ImageIcon from '@mui/icons-material/Image';
import { Button, TextField, Box, Typography, Paper, IconButton } from '@mui/material';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cardSchema } from '@/types/schemas/createCardSchema';

export type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  onSubmit: (_data: CardFormData) => Promise<void>;
  index: number;
}

export const CardForm: FC<CardFormProps> = ({ onSubmit, index }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rectoPreview, setRectoPreview] = useState<string>('');
  const [versoPreview, setVersoPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      term: '',
      definition: '',
    },
  });

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'recto' | 'verso'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'recto') {
          setRectoPreview(result);
          setValue('rectoImage', file);
        } else {
          setVersoPreview(result);
          setValue('versoImage', file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: CardFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
      setRectoPreview('');
      setVersoPreview('');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: '16px',
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        mb: 4,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Carte {index + 1}
      </Typography>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Terme"
            {...register('term')}
            error={!!errors.term}
            helperText={errors.term?.message}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          <TextField
            label="Définition"
            {...register('definition')}
            error={!!errors.definition}
            helperText={errors.definition?.message}
            multiline
            rows={4}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Image Recto
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: errors.rectoImage ? 'error.main' : 'divider',
                  borderRadius: '8px',
                  p: 2,
                  textAlign: 'center',
                  position: 'relative',
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {rectoPreview ? (
                  <img
                    src={rectoPreview}
                    alt="Recto preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <IconButton component="label" sx={{ width: '100%', height: '100%' }}>
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/gif"
                      onChange={e => handleImageUpload(e, 'recto')}
                    />
                    <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                  </IconButton>
                )}
              </Box>
              {errors.rectoImage && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.rectoImage.message}
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Image Verso
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: errors.versoImage ? 'error.main' : 'divider',
                  borderRadius: '8px',
                  p: 2,
                  textAlign: 'center',
                  position: 'relative',
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {versoPreview ? (
                  <img
                    src={versoPreview}
                    alt="Verso preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <IconButton component="label" sx={{ width: '100%', height: '100%' }}>
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/gif"
                      onChange={e => handleImageUpload(e, 'verso')}
                    />
                    <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                  </IconButton>
                )}
              </Box>
              {errors.versoImage && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.versoImage.message}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 4,
                py: 1.5,
              }}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la carte'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};
