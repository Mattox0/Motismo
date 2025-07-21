import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { IQuizzType } from '@/types/model/IQuizzType';
import { CreateQuizFormData, createQuizSchema } from '@/types/schemas/createQuizSchema';

import { Button } from './Button';

interface ICreateQuizFormProps {
  type: IQuizzType;
  onSubmit: (_data: CreateQuizFormData) => void;
  onCancel: () => void;
}

export const CreateQuizForm: FC<ICreateQuizFormProps> = ({ type, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateQuizFormData>({
    resolver: zodResolver(createQuizSchema),
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
    <form onSubmit={handleSubmit(onSubmit)} className="create-quiz-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          {t('create_quiz.form.title')}
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          placeholder={
            type === IQuizzType.QUESTIONS
              ? t('create_quiz.form.title_questions')
              : t('create_quiz.form.title_cards')
          }
        />
        {errors.title && <span className="form-error">{t(errors.title.message as string)}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">
          {t('create_quiz.form.image')}
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
                alt={t('create_quiz.form.image_preview')}
                className="image-upload__preview-image"
              />
            ) : (
              <div className="image-upload__placeholder">
                <span>{t('create_quiz.form.image_placeholder')}</span>
              </div>
            )}
          </div>
          {errors.image && <span className="form-error">{t(errors.image.message as string)}</span>}
        </div>
      </div>

      <div className="create-quiz-form__buttons">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('create_quiz.form.cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {t('create_quiz.form.submit')}
        </Button>
      </div>
    </form>
  );
};
