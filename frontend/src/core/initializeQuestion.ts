import { isChoiceBasedQuestion } from '@/constants/questionTypes';
import { IQuestionType } from '@/types/QuestionType';

export const initializeQuestion = (
  questionType: IQuestionType = IQuestionType.MULTIPLE_CHOICES
) => {
  const formData = new FormData();
  formData.append('title', '');
  formData.append('questionType', questionType);

  if (isChoiceBasedQuestion(questionType)) {
    formData.append(
      'choices',
      JSON.stringify([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
    );
  }

  return formData;
};
