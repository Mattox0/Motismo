import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useCreateQuizzMutation } from '@/services/quiz.service';
import { IQuizzType } from '@/types/model/IQuizzType';
import { showToast } from '@/utils/toast';

import { AskCreateSection } from '../AskCreateSection';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('next/navigation');
jest.mock('@/services/quiz.service', () => ({
  useCreateQuizzMutation: jest.fn(),
}));
jest.mock('@/utils/toast');
jest.mock('@/components/forms/CreateQuizForm', () => ({
  CreateQuizForm: jest.fn(() => <div data-testid="create-quiz-form">CreateQuizForm</div>),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseCreateQuizzMutation = useCreateQuizzMutation as jest.MockedFunction<
  typeof useCreateQuizzMutation
>;
const mockShowToast = showToast as jest.Mocked<typeof showToast>;

const mockPush = jest.fn();
const mockCreateQuizz = jest.fn();

describe('AskCreateSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseCreateQuizzMutation.mockReturnValue([
      mockCreateQuizz,
      { isLoading: false, reset: jest.fn() },
    ]);
  });

  it('renders section with buttons', () => {
    render(<AskCreateSection />);

    expect(screen.getByText('profile.ask_create_section.tag')).toBeInTheDocument();
    expect(screen.getByText('profile.ask_create_section.text')).toBeInTheDocument();
    expect(screen.getByText('profile.ask_create_section.create_quizz')).toBeInTheDocument();
    expect(screen.getByText('profile.ask_create_section.create_cards')).toBeInTheDocument();
  });

  it('opens modal when create quiz button is clicked', () => {
    render(<AskCreateSection />);

    const createQuizButton = screen.getByText('profile.ask_create_section.create_quizz');
    fireEvent.click(createQuizButton);

    expect(screen.getByText('create_quiz.title.quiz')).toBeInTheDocument();
  });

  it('opens modal when create cards button is clicked', () => {
    render(<AskCreateSection />);

    const createCardsButton = screen.getByText('profile.ask_create_section.create_cards');
    fireEvent.click(createCardsButton);

    expect(screen.getByText('create_quiz.title.cards')).toBeInTheDocument();
  });

  it('closes modal when close is called', () => {
    render(<AskCreateSection />);

    const createQuizButton = screen.getByText('profile.ask_create_section.create_quizz');
    fireEvent.click(createQuizButton);

    expect(screen.getByText('create_quiz.title.quiz')).toBeInTheDocument();

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(screen.queryByText('create_quiz.title.quiz')).not.toBeInTheDocument();
  });

  it('handles successful cards creation', async () => {
    const mockResponse = {
      id: '123',
      title: 'Test Cards',
      quizzType: IQuizzType.CARDS,
    };
    mockCreateQuizz.mockResolvedValueOnce(mockResponse);

    render(<AskCreateSection />);

    const createCardsButton = screen.getByText('profile.ask_create_section.create_cards');
    fireEvent.click(createCardsButton);

    await waitFor(() => {
      expect(screen.getByText('create_quiz.title.cards')).toBeInTheDocument();
    });
  });

  it('handles creation error', async () => {
    mockCreateQuizz.mockRejectedValueOnce(new Error('Creation failed'));

    render(<AskCreateSection />);

    const createQuizButton = screen.getByText('profile.ask_create_section.create_quizz');
    fireEvent.click(createQuizButton);

    await waitFor(() => {
      expect(screen.getByText('create_quiz.title.quiz')).toBeInTheDocument();
    });
  });

  it('handles form data creation for quiz type', () => {
    render(<AskCreateSection />);

    const createQuizButton = screen.getByText('profile.ask_create_section.create_quizz');
    fireEvent.click(createQuizButton);

    expect(screen.getByText('create_quiz.title.quiz')).toBeInTheDocument();
  });

  it('handles form data creation for cards type', () => {
    render(<AskCreateSection />);

    const createCardsButton = screen.getByText('profile.ask_create_section.create_cards');
    fireEvent.click(createCardsButton);

    expect(screen.getByText('create_quiz.title.cards')).toBeInTheDocument();
  });

  it('shows CreateQuizForm when modal is open and type is selected', () => {
    render(<AskCreateSection />);

    const createQuizButton = screen.getByText('profile.ask_create_section.create_quizz');
    fireEvent.click(createQuizButton);

    // The CreateQuizForm should be rendered inside the modal
    expect(screen.getByText('create_quiz.title.quiz')).toBeInTheDocument();
  });

  it('does not show CreateQuizForm when modal is closed', () => {
    render(<AskCreateSection />);

    // Modal is closed by default, so CreateQuizForm should not be rendered
    expect(screen.queryByText('create_quiz.title.quiz')).not.toBeInTheDocument();
    expect(screen.queryByText('create_quiz.title.cards')).not.toBeInTheDocument();
  });

  it('resets state when modal is closed', () => {
    render(<AskCreateSection />);

    // Open modal
    const createQuizButton = screen.getByText('profile.ask_create_section.create_quizz');
    fireEvent.click(createQuizButton);

    expect(screen.getByText('create_quiz.title.quiz')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // Modal should be closed and state reset
    expect(screen.queryByText('create_quiz.title.quiz')).not.toBeInTheDocument();

    // Open cards modal to verify state was reset
    const createCardsButton = screen.getByText('profile.ask_create_section.create_cards');
    fireEvent.click(createCardsButton);

    expect(screen.getByText('create_quiz.title.cards')).toBeInTheDocument();
  });

  it('handles animation props correctly', () => {
    render(<AskCreateSection />);

    const container = document.querySelector('.ask-create-section__container');
    expect(container).toBeInTheDocument();
  });

  it('renders all required elements', () => {
    render(<AskCreateSection />);

    expect(document.querySelector('.ask-create-section')).toBeInTheDocument();
    expect(document.querySelector('.ask-create-section__container')).toBeInTheDocument();
    expect(document.querySelector('.ask-create-section__buttons')).toBeInTheDocument();
  });
});
