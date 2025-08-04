import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { useQuizz } from '@/providers/QuizzProvider';
import { IQuestion } from '@/types/model/IQuestion';
import { IQuestionType } from '@/types/QuestionType';

import { QuestionItem } from '../QuestionItem';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@/providers/QuizzProvider', () => ({
  useQuizz: jest.fn(),
}));

describe('QuestionItem', () => {
  const mockT = jest.fn((key: string) => {
    const translations: { [key: string]: string } = {
      'question.types.multipleChoices': 'Multiple Choices',
      'question.types.uniqueChoice': 'Unique Choice',
      'question.types.boolean': 'Boolean',
      'question.types.wordCloud': 'Word Cloud',
      'question.types.matching': 'Matching',
      'question.altTitle': 'Untitled Question',
      'question.choicesCount': 'choices',
      'question.delete': 'Delete question',
    };
    return translations[key] || key;
  });

  const mockSelectCurrentQuestion = jest.fn();

  const mockQuestion: IQuestion = {
    id: '1',
    title: 'Test Question',
    order: 1,
    questionType: IQuestionType.MULTIPLE_CHOICES,
    image: '',
    choices: [
      { id: '1', text: 'Choice 1', isCorrect: true },
      { id: '2', text: 'Choice 2', isCorrect: false },
    ],
  };

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useQuizz as jest.Mock).mockReturnValue({
      selectCurrentQuestion: mockSelectCurrentQuestion,
    });
  });

  it('renders question with correct title and order', () => {
    render(<QuestionItem question={mockQuestion} active={false} />);

    expect(screen.getByText('Test Question')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies active class when active prop is true', () => {
    const { container } = render(<QuestionItem question={mockQuestion} active={true} />);

    const questionItem = container.querySelector('.question-item');
    expect(questionItem).toHaveClass('question-item--active');
  });

  it('calls selectCurrentQuestion when clicked', () => {
    render(<QuestionItem question={mockQuestion} active={false} />);

    const questionItem = screen.getByText('Test Question').closest('.question-item');
    fireEvent.click(questionItem!);

    expect(mockSelectCurrentQuestion).toHaveBeenCalledWith('1');
  });
});
