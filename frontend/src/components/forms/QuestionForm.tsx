import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CloseIcon from '@mui/icons-material/Close';
import { useRef, useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/components/forms/Input';
import { useQuizz } from '@/providers/QuizzProvider';
import { createQuestionSchema } from '@/types/schemas/createQuestionForm';
import { showToast } from '@/utils/toast';

import { Button } from './Button';

export type QuestionFormData = {
  title: string;
  image?: File;
  choices: Array<{
    text: string;
    isCorrect: boolean;
  }>;
};

interface IQuestionFormProps {
  onSubmit: (_data: QuestionFormData) => Promise<void>;
  initialData?: Partial<QuestionFormData>;
  onDelete: () => void;
}

const QuestionForm = ({ onSubmit, initialData, onDelete }: IQuestionFormProps) => {
  const { t } = useTranslation();
  const { currentQuestion } = useQuizz();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentQuestion?.image || null);

  const schema = createQuestionSchema(t);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      choices: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  });

  useEffect(() => {
    if (currentQuestion) {
      reset({
        title: currentQuestion.title || '',
        choices: currentQuestion.choices?.map(choice => ({
          text: choice.text || '',
          isCorrect: choice.isCorrect || false,
        })) || [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      });
      setImagePreview(currentQuestion.image || null);
    } else if (initialData) {
      reset({
        title: initialData.title || '',
        choices: initialData.choices || [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      });
    }
  }, [currentQuestion, initialData]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
  });

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('image', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit: SubmitHandler<QuestionFormData> = async formData => {
    try {
      await onSubmit(formData);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      showToast.error((error as any)?.message || t('question.createError'));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="question-form">
      <Input
        label={t('question.title')}
        placeholder={t('question.titlePlaceholder')}
        registration={register('title')}
        error={errors.title?.message}
      />

      <div className="form-group">
        <label htmlFor="image" className="form-label">
          {t('question.image')}
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
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={t('create_quiz.form.image_preview')}
                className="image-upload__preview-image"
              />
            ) : (
              <div className="image-upload__placeholder">
                <span>{t('create_quiz.form.image_placeholder')}</span>
              </div>
            )}
          </div>
          {errors.image && <span className="form-error">{errors.image.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <div className="form-label">{t('question.choices')}</div>
        <div className="answers-list">
          {fields.map((field, index) => (
            <div key={field.id} className="answer-item">
              <Input
                placeholder={t('question.answerPlaceholder', { number: index + 1 })}
                registration={register(`choices.${index}.text`)}
                error={errors.choices?.[index]?.text?.message}
              />
              <div className="answer-actions">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register(`choices.${index}.isCorrect`)}
                    className="checkbox-input"
                  />
                  <CheckBoxOutlineBlankIcon className="checkbox-icon checkbox-icon--unchecked" />
                  <CheckBoxIcon className="checkbox-icon checkbox-icon--checked" />
                </label>
                {fields.length > 2 && (
                  <button
                    type="button"
                    className="btn btn-icon answer-remove"
                    onClick={() => remove(index)}
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            </div>
          ))}
          {errors.choices && !Array.isArray(errors.choices) && (
            <p className="error-message">{errors.choices.message}</p>
          )}
          <button
            type="button"
            className="btn btn-outline add-answer-btn"
            onClick={() => append({ text: '', isCorrect: false })}
            disabled={fields.length >= 6}
          >
            <AddIcon />
            {t('question.addAnswer')}
          </button>
        </div>
      </div>
      <div className="question-form__buttons">
        <Button type="submit" variant="colored" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('question.save')}
        </Button>
        <Button type="button" variant="error" onClick={onDelete}>
          {t('common.delete')}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
