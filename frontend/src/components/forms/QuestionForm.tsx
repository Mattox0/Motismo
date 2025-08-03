import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CloseIcon from '@mui/icons-material/Close';
import QuizIcon from '@mui/icons-material/Quiz';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useRef, useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '@/components/forms/Input';
import {
  getQuestionTypeOptions,
  isChoiceBasedQuestion,
  isMultipleChoiceQuestion,
  isSingleChoiceQuestion,
  isBooleanQuestion,
} from '@/constants/questionTypes';
import { useQuizz } from '@/providers/QuizzProvider';
import { IQuestionType } from '@/types/QuestionType';
import { createQuestionSchema } from '@/types/schemas/createQuestionForm';
import { showToast } from '@/utils/toast';

import { EmptyState } from '../EmptyState';

import { Button } from './Button';

export type QuestionFormData = {
  title: string;
  image?: File;
  questionType: IQuestionType;
  choices?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string;
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
  const questionTypeOptions = getQuestionTypeOptions(t);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      questionType: IQuestionType.MULTIPLE_CHOICES,
      choices: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
      correctAnswer: undefined,
    },
  });

  const watchedQuestionType = watch('questionType');

  useEffect(() => {
    const currentChoices = watch('choices');

    if (isBooleanQuestion(watchedQuestionType)) {
      setValue('choices', [
        { text: t('question.true'), isCorrect: true },
        { text: t('question.false'), isCorrect: false },
      ]);
      setValue('correctAnswer', '0');
    } else if (
      isChoiceBasedQuestion(watchedQuestionType) &&
      !isBooleanQuestion(watchedQuestionType)
    ) {
      const isBooleanToOther =
        currentChoices &&
        currentChoices.length === 2 &&
        (currentChoices[0].text === t('question.true') || currentChoices[0].text === 'True') &&
        (currentChoices[1].text === t('question.false') || currentChoices[1].text === 'False');

      if (isBooleanToOther) {
        setValue('choices', [
          { text: t('question.option', { number: 1 }), isCorrect: true },
          { text: t('question.option', { number: 2 }), isCorrect: false },
        ]);
        setValue('correctAnswer', '0');
      } else if (!currentChoices || currentChoices.length < 2) {
        setValue('choices', [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
        ]);
        if (isSingleChoiceQuestion(watchedQuestionType)) {
          setValue('correctAnswer', '0');
        }
      } else {
        const hasCorrectChoice = currentChoices.some(choice => choice.isCorrect);
        if (!hasCorrectChoice && currentChoices.length > 0) {
          const updatedChoices = currentChoices.map((choice, index) => ({
            ...choice,
            isCorrect: index === 0,
          }));
          setValue('choices', updatedChoices);
          if (isSingleChoiceQuestion(watchedQuestionType)) {
            setValue('correctAnswer', '0');
          }
        }
      }
    }
  }, [watchedQuestionType, setValue, t, watch]);

  useEffect(() => {
    if (currentQuestion) {
      const choices = currentQuestion.choices?.map(choice => ({
        text: choice.text || '',
        isCorrect: choice.isCorrect || false,
      })) || [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];

      let correctAnswer: string | undefined;
      if (isSingleChoiceQuestion(currentQuestion.questionType)) {
        const correctIndex = choices.findIndex(choice => choice.isCorrect);
        correctAnswer = correctIndex >= 0 ? correctIndex.toString() : undefined;
      }

      reset({
        title: currentQuestion.title || '',
        questionType: currentQuestion.questionType || IQuestionType.MULTIPLE_CHOICES,
        choices,
        correctAnswer,
      });
      setImagePreview(currentQuestion.image || null);
    } else if (initialData) {
      let correctAnswer: string | undefined;
      if (
        initialData.questionType &&
        isSingleChoiceQuestion(initialData.questionType) &&
        initialData.choices
      ) {
        const correctIndex = initialData.choices.findIndex(choice => choice.isCorrect);
        correctAnswer = correctIndex >= 0 ? correctIndex.toString() : undefined;
      }

      reset({
        title: initialData.title || '',
        questionType: initialData.questionType || IQuestionType.MULTIPLE_CHOICES,
        choices: initialData.choices || [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
        ],
        correctAnswer,
      });
    }
  }, [currentQuestion, initialData, reset]);

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
      if (isSingleChoiceQuestion(formData.questionType) && formData.correctAnswer !== undefined) {
        const correctIndex = parseInt(formData.correctAnswer);
        const updatedChoices = formData.choices?.map((choice, index) => ({
          ...choice,
          isCorrect: index === correctIndex,
        }));

        const updatedFormData = {
          ...formData,
          choices: updatedChoices,
        };
        delete updatedFormData.correctAnswer;

        await onSubmit(updatedFormData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      showToast.error((error as any)?.message || t('question.createError'));
    }
  };

  if (!currentQuestion) {
    return (
      <div className="question-form__empty-state">
        <EmptyState title="Aucune question" description="Ajoutez une question pour commencer" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="question-form">
      <Input
        label={t('question.title')}
        placeholder={t('question.titlePlaceholder')}
        registration={register('title')}
        error={errors.title?.message}
      />

      <div className="form-group">
        <label className="form-label">{t('question.type')}</label>
        <div className="question-type-selector">
          {questionTypeOptions.map(option => (
            <div
              key={option.value}
              className={`question-type-option ${
                watchedQuestionType === option.value ? 'question-type-option--selected' : ''
              }`}
              onClick={() => setValue('questionType', option.value, { shouldValidate: true })}
            >
              <div className="question-type-option__icon">{option.icon}</div>
              <div className="question-type-option__content">
                <h4 className="question-type-option__label">{option.label}</h4>
                <p className="question-type-option__description">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
        {errors.questionType && <span className="form-error">{errors.questionType.message}</span>}
      </div>

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

      {isChoiceBasedQuestion(watchedQuestionType) && (
        <div className="form-group">
          <div className="form-label">{t('question.choices')}</div>
          <div className="answers-list">
            {fields.map((field, index) => (
              <div key={field.id} className="answer-item">
                {isBooleanQuestion(watchedQuestionType) ? (
                  <div className="answer-item__content">
                    <div className="answer-text answer-text--fixed">{field.text}</div>
                    <div className="answer-actions">
                      <label className="radio-label">
                        <input
                          type="radio"
                          value={index}
                          {...register('correctAnswer')}
                          className="radio-input"
                        />
                        <RadioButtonUncheckedIcon className="radio-icon radio-icon--unchecked" />
                        <RadioButtonCheckedIcon className="radio-icon radio-icon--checked" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder={t('question.answerPlaceholder', { number: index + 1 })}
                      registration={register(`choices.${index}.text`)}
                      error={errors.choices?.[index]?.text?.message}
                    />
                    <div className="answer-actions">
                      {isMultipleChoiceQuestion(watchedQuestionType) ? (
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            {...register(`choices.${index}.isCorrect`)}
                            className="checkbox-input"
                          />
                          <CheckBoxOutlineBlankIcon className="checkbox-icon checkbox-icon--unchecked" />
                          <CheckBoxIcon className="checkbox-icon checkbox-icon--checked" />
                        </label>
                      ) : (
                        <label className="radio-label">
                          <input
                            type="radio"
                            value={index}
                            {...register('correctAnswer')}
                            className="radio-input"
                          />
                          <RadioButtonUncheckedIcon className="radio-icon radio-icon--unchecked" />
                          <RadioButtonCheckedIcon className="radio-icon radio-icon--checked" />
                        </label>
                      )}
                      {fields.length > 2 && !isBooleanQuestion(watchedQuestionType) && (
                        <button
                          type="button"
                          className="btn btn-icon answer-remove"
                          onClick={() => remove(index)}
                        >
                          <CloseIcon />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            {errors.choices && !Array.isArray(errors.choices) && (
              <p className="error-message">{errors.choices.message}</p>
            )}
            {!isBooleanQuestion(watchedQuestionType) && (
              <button
                type="button"
                className="btn btn-outline add-answer-btn"
                onClick={() => append({ text: '', isCorrect: false })}
                disabled={fields.length >= 6}
              >
                <AddIcon />
                {t('question.addAnswer')}
              </button>
            )}
          </div>
        </div>
      )}

      {!isChoiceBasedQuestion(watchedQuestionType) && (
        <div className="form-group">
          <div className="question-type-info">
            <QuizIcon className="question-type-info__icon" />
            <div className="question-type-info__content">
              <h4>{questionTypeOptions.find(opt => opt.value === watchedQuestionType)?.label}</h4>
              <p>{t('question.noChoicesRequired')}</p>
            </div>
          </div>
        </div>
      )}
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
