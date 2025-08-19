import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { IQuizz } from '@/types/model/IQuizz';
import { EditQuizFormData, editQuizSchema } from '@/types/schemas/editQuizSchema';

import { Button } from './Button';

interface IEditQuizFormProps {
  quiz: IQuizz;
  onSubmit: (_data: EditQuizFormData) => void;
  onCancel: () => void;
}

export const EditQuizForm: FC<IEditQuizFormProps> = ({ quiz, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditQuizFormData>({
    resolver: zodResolver(editQuizSchema),
    defaultValues: {
      title: quiz.title,
    },
  });

  const selectedFile = watch('image');

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('image', file, { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="edit-quiz-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          {t('edit_quiz.form.title')}
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          placeholder={t('edit_quiz.form.title_placeholder')}
        />
        {errors.title && <span className="form-error">{t(errors.title.message as string)}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">
          {t('edit_quiz.form.image')}
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
                alt={t('edit_quiz.form.image_preview')}
                className="image-upload__preview-image"
              />
            ) : quiz.image ? (
              <img
                src={quiz.image}
                alt={t('edit_quiz.form.current_image')}
                className="image-upload__preview-image"
              />
            ) : (
              <div className="image-upload__placeholder">
                <span>{t('edit_quiz.form.image_placeholder')}</span>
              </div>
            )}
          </div>
          {errors.image && <span className="form-error">{t(errors.image.message as string)}</span>}
        </div>
      </div>

      <div className="edit-quiz-form__buttons">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('edit_quiz.form.cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {t('edit_quiz.form.submit')}
        </Button>
      </div>
    </form>
  );
};
