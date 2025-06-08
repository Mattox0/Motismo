'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import ImageIcon from '@mui/icons-material/Image';
import { FC, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card } from '@/types/model/Card';
import { cardSchema } from '@/types/schemas/createCardSchema';

export type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  onSubmit: (_data: CardFormData, _id: string) => Promise<void>;
  index: number;
  initialData: Card;
}

type ContentType = 'text' | 'image';

export const CardForm: FC<CardFormProps> = ({ onSubmit, index, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rectoPreview, setRectoPreview] = useState<string>(initialData.rectoImage || '');
  const [versoPreview, setVersoPreview] = useState<string>(initialData.versoImage || '');
  const [rectoType, setRectoType] = useState<ContentType>(
    initialData.rectoImage ? 'image' : 'text'
  );
  const [versoType, setVersoType] = useState<ContentType>(
    initialData.versoImage ? 'image' : 'text'
  );
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      term: initialData.rectoText || '',
      definition: initialData.versoText || '',
      rectoImage: undefined,
      versoImage: undefined,
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
          setValue('term', '');
        } else {
          setVersoPreview(result);
          setValue('versoImage', file);
          setValue('definition', '');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTypeChange = (type: ContentType, side: 'recto' | 'verso') => {
    if (side === 'recto') {
      setRectoType(type);
      if (type === 'text') {
        setRectoPreview('');
        setValue('rectoImage', undefined);
      } else {
        setValue('term', '');
      }
    } else {
      setVersoType(type);
      if (type === 'text') {
        setVersoPreview('');
        setValue('versoImage', undefined);
      } else {
        setValue('definition', '');
      }
    }
  };

  const handleFormSubmit = async (data: CardFormData) => {
    try {
      console.log('oui');
      setIsSubmitting(true);
      await onSubmit(data, initialData.id);
      reset();
      setRectoPreview('');
      setVersoPreview('');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <div className="card-form">
      <h2 className="card-form__title">Carte {index + 1}</h2>
      <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} className="card-form__form">
        <div className="card-form__side">
          <div className="card-form__type-selector">
            <button
              type="button"
              className={`card-form__type-button ${rectoType === 'text' ? 'active' : ''}`}
              onClick={() => handleTypeChange('text', 'recto')}
            >
              Texte
            </button>
            <button
              type="button"
              className={`card-form__type-button ${rectoType === 'image' ? 'active' : ''}`}
              onClick={() => handleTypeChange('image', 'recto')}
            >
              Image
            </button>
          </div>

          {rectoType === 'text' ? (
            <div className="card-form__field">
              <label htmlFor="term" className="card-form__label">
                Terme
              </label>
              <textarea id="term" placeholder="Entrez le terme" {...register('term')} />
              {errors.term && <div className="card-form__error">{errors.term.message}</div>}
            </div>
          ) : (
            <div className="card-form__image-container">
              <h3 className="card-form__image-title">Image du terme</h3>
              <div
                className={`card-form__image-upload ${errors.rectoImage ? 'card-form__image-upload--error' : ''}`}
              >
                {rectoPreview ? (
                  <img src={rectoPreview} alt="Terme preview" />
                ) : (
                  <label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={e => handleImageUpload(e, 'recto')}
                    />
                    <ImageIcon style={{ fontSize: 40, color: '#666' }} />
                  </label>
                )}
              </div>
              {errors.rectoImage && (
                <div className="card-form__error">{errors.rectoImage.message}</div>
              )}
            </div>
          )}
        </div>

        <div className="card-form__side">
          <div className="card-form__type-selector">
            <button
              type="button"
              className={`card-form__type-button ${versoType === 'text' ? 'active' : ''}`}
              onClick={() => handleTypeChange('text', 'verso')}
            >
              Texte
            </button>
            <button
              type="button"
              className={`card-form__type-button ${versoType === 'image' ? 'active' : ''}`}
              onClick={() => handleTypeChange('image', 'verso')}
            >
              Image
            </button>
          </div>

          {versoType === 'text' ? (
            <div className="card-form__field">
              <label htmlFor="definition" className="card-form__label">
                Définition
              </label>
              <textarea
                id="definition"
                placeholder="Entrez la définition"
                {...register('definition')}
              />
              {errors.definition && (
                <div className="card-form__error">{errors.definition.message}</div>
              )}
            </div>
          ) : (
            <div className="card-form__image-container">
              <h3 className="card-form__image-title">Image de la définition</h3>
              <div
                className={`card-form__image-upload ${errors.versoImage ? 'card-form__image-upload--error' : ''}`}
              >
                {versoPreview ? (
                  <img src={versoPreview} alt="Définition preview" />
                ) : (
                  <label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={e => handleImageUpload(e, 'verso')}
                    />
                    <ImageIcon style={{ fontSize: 40, color: '#666' }} />
                  </label>
                )}
              </div>
              {errors.versoImage && (
                <div className="card-form__error">{errors.versoImage.message}</div>
              )}
            </div>
          )}
        </div>
      </form>
      <div className="card-form__submit">
        <button type="button" onClick={handleButtonClick} disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer la carte'}
        </button>
      </div>
    </div>
  );
};
