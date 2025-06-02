import { QuestionType } from '@/types/QuestionType';

export const initializeQuestion = () => {
  const formData = new FormData();
  formData.append('title', '');
  formData.append('questionType', QuestionType.MULTIPLE_CHOICES);
  formData.append(
    'choices',
    JSON.stringify([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ])
  );
  return formData;
};
