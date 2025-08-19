import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGetClassesQuery } from '@/services/classe.service';
import { IQuizz } from '@/types/model/IQuizz';
import { EditCardFormData, editCardSchema } from '@/types/schemas/editCardSchema';

import { Button } from './Button';
import { ClassSelector } from './ClassSelector';

interface IEditCardFormProps {
  card: IQuizz;
  onSubmit: (_data: EditCardFormData) => void;
  onCancel: () => void;
}

export const EditCardForm: FC<IEditCardFormProps> = ({ card, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: classes = [] } = useGetClassesQuery();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditCardFormData>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      title: card.title,
      classIds: card.classes?.map(classe => classe.id) || [],
    },
  });

  const selectedFile = watch('image');
  const selectedClassIds = watch('classIds') || [];

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('image', file, { shouldValidate: true });
    }
  };

  const handleClassSelectionChange = (classIds: string[]) => {
    setValue('classIds', classIds, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="edit-card-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          {t('edit_card.form.title')}
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          placeholder={t('edit_card.form.title_placeholder')}
        />
        {errors.title && <span className="form-error">{t(errors.title.message as string)}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">
          {t('edit_card.form.image')}
        </label>
        <div className="image-upload">
          <input
            type="file"
            id="image"
            accept="image/jpeg,image/png,image/gif,image/jpg"
            className="image-upload__input"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div
            className={`image-upload__preview ${errors.image ? 'image-upload__preview--error' : ''}`}
            onClick={handleFileClick}
          >
            {selectedFile ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={t('edit_card.form.image_preview')}
                className="image-upload__preview-image"
              />
            ) : card.image ? (
              <img
                src={card.image}
                alt={t('edit_card.form.current_image')}
                className="image-upload__preview-image"
              />
            ) : (
              <div className="image-upload__placeholder">
                <span>{t('edit_card.form.image_placeholder')}</span>
              </div>
            )}
          </div>
          {errors.image && <span className="form-error">{t(errors.image.message as string)}</span>}
        </div>
      </div>

      <div className="form-group">
        <ClassSelector
          classes={classes}
          selectedClassIds={selectedClassIds}
          onSelectionChange={handleClassSelectionChange}
          error={errors.classIds?.message}
        />
      </div>

      <div className="edit-card-form__buttons">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('edit_card.form.cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {t('edit_card.form.submit')}
        </Button>
      </div>
    </form>
  );
};
